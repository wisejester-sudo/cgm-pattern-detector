import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { validateTwilioSignature } from "@/lib/twilio"
import { checkRateLimit, getClientIdentifier, rateLimitConfigs } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"

export const dynamic = 'force-dynamic'

// GET /api/sms/webhook - Twilio webhook for incoming SMS
export async function GET(request: NextRequest) {
  return handleWebhook(request)
}

// POST /api/sms/webhook - Twilio webhook for incoming SMS
export async function POST(request: NextRequest) {
  return handleWebhook(request)
}

async function handleWebhook(request: NextRequest) {
  try {
    // Rate limiting: 50 webhook requests per minute per IP
    const identifier = getClientIdentifier(request)
    const rateLimit = checkRateLimit(`sms-webhook:${identifier}`, {
      ...rateLimitConfigs.sms,
      maxRequests: 50, // Higher limit for webhooks
    })
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      )
    }

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }
    
    // Parse form data from Twilio
    let params: Record<string, string> = {}
    
    if (request.method === "POST") {
      const formData = await request.formData()
      formData.forEach((value, key) => {
        params[key] = value.toString()
      })
    } else {
      const { searchParams } = new URL(request.url)
      searchParams.forEach((value, key) => {
        params[key] = value
      })
    }

    // Validate Twilio signature in production
    if (process.env.NODE_ENV === "production") {
      const signature = request.headers.get("X-Twilio-Signature") || ""
      const url = request.url
      
      if (!validateTwilioSignature(signature, url, params)) {
        logger.error("Invalid Twilio signature")
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 403 }
        )
      }
    }

    // Extract message details
    const {
      From: from,
      Body: body,
      MessageSid: messageSid,
      NumMedia: numMedia,
    } = params

    if (!from || !body) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Normalize phone number for lookup
    const normalizedPhone = from.replace(/\D/g, "").slice(-10)

    // Find the most recent job for this phone number
    // SECURITY: Use parameterized ilike to prevent SQL injection
    const { data: recentJob } = await supabase
      .from("jobs")
      .select("id, customer_name, assigned_tech_ids")
      .ilike("customer_phone", `%${normalizedPhone}%`)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    // Store inbound message in sms_logs
    const { data: smsLog, error: logError } = await supabase
      .from("sms_logs")
      .insert({
        job_id: recentJob?.id || null,
        recipient_phone: from,
        message_body: body,
        status: "received",
        message_sid: messageSid,
        direction: "inbound",
      })
      .select()
      .single()

    if (logError) {
      logger.error("Error logging message:", logError)
    }

    // Check if this is a YES approval response
    const trimmedBody = body.trim().toUpperCase()
    if (trimmedBody === "YES" && recentJob) {
      // Create an approval update
      await supabase
        .from("job_updates")
        .insert({
          job_id: recentJob.id,
          status: "working",
          notes: "Customer approved work via SMS",
          photos: [],
          created_by_tech_id: recentJob.assigned_tech_ids?.[0] ?? null,
        })

      // Update job status to working if needed
      await supabase
        .from("jobs")
        .update({ 
          status: "working",
          updated_at: new Date().toISOString(),
        })
        .eq("id", recentJob.id)
    }

    // Return TwiML response (empty response is fine)
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: {
          "Content-Type": "application/xml",
        },
      }
    )
  } catch (error) {
    logger.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
