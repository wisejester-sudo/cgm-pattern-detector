import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { validateTwilioSignature } from "@/lib/twilio"
import { checkRateLimit, getClientIdentifier, rateLimitConfigs } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"

// Keyword mappings for status updates
const STATUS_KEYWORDS: Record<string, string> = {
  // En Route
  "E": "enroute",
  "EN": "enroute",
  "ENR": "enroute",
  "ENROUTE": "enroute",
  "OMW": "enroute",
  "ONMYWAY": "enroute",
  "HEADING": "enroute",
  "ON THE WAY": "enroute",
  // Working
  "W": "working",
  "WRK": "working",
  "WORKING": "working",
  "STARTED": "working",
  "ARRIVED": "working",
  "HERE": "working",
  "BEGIN": "working",
  // Complete
  "C": "complete",
  "CMP": "complete",
  "COMPLETE": "complete",
  "DONE": "complete",
  "FINISHED": "complete",
  "FIN": "complete",
  "WRAP": "complete",
}

const STATUS_LABELS: Record<string, string> = {
  "enroute": "En Route",
  "working": "Working",
  "complete": "Complete"
}

// POST /api/sms/incoming - Twilio webhook for incoming SMS from technicians
export async function POST(request: NextRequest) {
  return handleIncomingSMS(request)
}

// GET /api/sms/incoming - Twilio webhook (fallback)
export async function GET(request: NextRequest) {
  return handleIncomingSMS(request)
}

async function handleIncomingSMS(request: NextRequest) {
  try {
    // Rate limiting: 100 webhook requests per minute per IP
    const identifier = getClientIdentifier(request)
    const rateLimit = checkRateLimit(`sms-incoming:${identifier}`, {
      ...rateLimitConfigs.sms,
      maxRequests: 100,
    })
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
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
    } = params

    if (!from || !body) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Normalize phone number for lookup
    const normalizedPhone = from.replace(/\D/g, "")
    
    // Message received - processing

    // STEP 1: Look up technician by phone number
    const { data: technician, error: techError } = await supabase
      .from("technicians")
      .select("id, name, company_id, phone")
      .eq("phone", normalizedPhone)
      .single()

    if (techError || !technician) {
      // No technician found with this phone number
      // Store message but don't process as status update
      await logIncomingMessage(supabase, {
        from,
        body,
        messageSid,
        technicianId: null,
        jobId: null,
        parsedAs: "unknown_sender"
      })
      
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { status: 200, headers: { "Content-Type": "application/xml" } }
      )
    }

    // Technician found - checking for active job

    // STEP 2: Find technician's most recent active job
    const { data: activeJob, error: jobError } = await supabase
      .from("jobs")
      .select("id, customer_name, customer_phone, customer_address, status, admin_id")
      .contains("assigned_tech_ids", [technician.id])
      .in("status", ["scheduled", "en_route", "working"])
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (jobError || !activeJob) {
      // No active job assigned to this technician
      // Send reply: No active job
      await sendSMSReply(normalizedPhone, 
        `Hi ${technician.name}, you don't have any active jobs. Contact your dispatcher if you think this is an error.`)
      
      await logIncomingMessage(supabase, {
        from,
        body,
        messageSid,
        technicianId: technician.id,
        jobId: null,
        parsedAs: "no_active_job"
      })
      
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { status: 200, headers: { "Content-Type": "application/xml" } }
      )
    }

    // Active job found - processing status update

    // STEP 3: Parse the message body for keywords
    const trimmedBody = body.trim().toUpperCase()
    const words = trimmedBody.split(/\s+/)
    const firstWord = words[0]
    
    let newStatus: string | null = null
    let keywordMatched = ""
    
    // Check for exact keyword match
    if (STATUS_KEYWORDS[trimmedBody]) {
      newStatus = STATUS_KEYWORDS[trimmedBody]
      keywordMatched = trimmedBody
    } else if (STATUS_KEYWORDS[firstWord]) {
      newStatus = STATUS_KEYWORDS[firstWord]
      keywordMatched = firstWord
    }

    // STEP 4: If keyword found, update job status
    if (newStatus) {
      // Keyword matched - updating job status
      
      // Validate status transition
      const validTransition = isValidStatusTransition(activeJob.status, newStatus)
      
      if (!validTransition) {
        // Invalid status transition - notify technician
        await sendSMSReply(normalizedPhone,
          `Your job is already "${STATUS_LABELS[activeJob.status]}". Current status: ${activeJob.status.toUpperCase()}`)
        
        await logIncomingMessage(supabase, {
          from,
          body,
          messageSid,
          technicianId: technician.id,
          jobId: activeJob.id,
          parsedAs: `invalid_transition:${activeJob.status}->${newStatus}`
        })
        
        return new NextResponse(
          '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
          { status: 200, headers: { "Content-Type": "application/xml" } }
        )
      }

      // Update job status
      const { error: updateError } = await supabase
        .from("jobs")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", activeJob.id)

      if (updateError) {
        logger.error("Error updating job:", updateError)
        await sendSMSReply(normalizedPhone,
          "Sorry, there was an error updating your status. Please try again or use the app.")
        
        return new NextResponse(
          '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
          { status: 200, headers: { "Content-Type": "application/xml" } }
        )
      }

      // Create update record
      const { error: updateRecordError } = await supabase
        .from("updates")
        .insert({
          job_id: activeJob.id,
          status: newStatus as any,
          notes: `Status updated via SMS keyword "${keywordMatched}"`,
          created_at: new Date().toISOString()
        })

      if (updateRecordError) {
        logger.error("Error creating update record:", updateRecordError)
      }

      // Send confirmation to technician
      const confirmationMessage = buildConfirmationMessage(newStatus, activeJob)
      await sendSMSReply(normalizedPhone, confirmationMessage)

      // Notify customer of status change
      await notifyCustomerOfStatusChange(supabase, activeJob, newStatus, technician.name)

      // Log the incoming message
      await logIncomingMessage(supabase, {
        from,
        body,
        messageSid,
        technicianId: technician.id,
        jobId: activeJob.id,
        parsedAs: `status_update:${newStatus}`,
        keyword: keywordMatched
      })

      // Status updated successfully

    } else {
      // No keyword matched - treat as a note/comment
      // No keyword matched - storing message as note
      
      // Store as an update note
      await supabase
        .from("updates")
        .insert({
          job_id: activeJob.id,
          status: activeJob.status as any,
          notes: `SMS from technician: "${body}"`,
          created_at: new Date().toISOString()
        })

      // Send acknowledgment
      await sendSMSReply(normalizedPhone,
        `Note received for ${activeJob.customer_name}. Reply with E (En Route), W (Working), or C (Complete) to update status.`)

      await logIncomingMessage(supabase, {
        from,
        body,
        messageSid,
        technicianId: technician.id,
        jobId: activeJob.id,
        parsedAs: "note",
        keyword: null
      })
    }

    // Return empty TwiML response (we sent replies via API if needed)
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

// Helper: Check if status transition is valid
function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
  const transitions: Record<string, string[]> = {
    "scheduled": ["enroute", "working", "complete"],
    "enroute": ["working", "complete"],
    "working": ["complete"],
    "complete": []
  }
  
  return transitions[currentStatus]?.includes(newStatus) ?? false
}

// Helper: Build confirmation message
function buildConfirmationMessage(status: string, job: any): string {
  const customerFirstName = job.customer_name?.split(" ")[0] || "Customer"
  
  switch (status) {
    case "enroute":
      return `✓ En route to ${customerFirstName}. Customer will be notified of your ETA.`
    case "working":
      return `✓ Started work at ${customerFirstName}. Take photos and add notes at getdispatchly.co/t/${job.id}`
    case "complete":
      return `✓ Job complete! Great work. Finalize details at getdispatchly.co/t/${job.id} if needed.`
    default:
      return `✓ Status updated to ${STATUS_LABELS[status] || status}`
  }
}

// Helper: Send SMS reply via Twilio
async function sendSMSReply(to: string, body: string): Promise<void> {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !fromNumber) {
      // Twilio not configured - would send: body
      return
    }

    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: to,
          From: fromNumber,
          Body: body,
        }),
      }
    )

    if (!twilioResponse.ok) {
      const errorData = await twilioResponse.text()
      logger.error("SMS reply Twilio error:", errorData)
    } else {
      // SMS reply sent successfully
    }
  } catch (error) {
    logger.error("Error sending SMS reply:", error)
  }
}

// Helper: Notify customer of status change
async function notifyCustomerOfStatusChange(
  supabase: any,
  job: any,
  newStatus: string,
  technicianName: string
): Promise<void> {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !fromNumber) {
      // Customer notification skipped - Twilio not configured
      return
    }

    let message = ""
    const customerName = job.customer_name?.split(" ")[0] || "there"

    switch (newStatus) {
      case "enroute":
        message = `Hi ${customerName}, ${technicianName} from Dispatchly is on the way to your location. Estimated arrival: 15-20 minutes.`
        break
      case "working":
        message = `Hi ${customerName}, ${technicianName} has arrived and started working on your service request.`
        break
      case "complete":
        message = `Hi ${customerName}, ${technicianName} has completed the work. We'll send a follow-up survey shortly. Thanks for choosing us!`
        break
      default:
        return // Don't send for other statuses
    }

    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: job.customer_phone,
          From: fromNumber,
          Body: message,
        }),
      }
    )

    if (!twilioResponse.ok) {
      const errorData = await twilioResponse.text()
      logger.error("Customer notification Twilio error:", errorData)
    } else {
      // Customer notification sent
    }

    // Store in SMS logs
    await supabase.from("sms_logs").insert({
      job_id: job.id,
      from_number: fromNumber,
      to_number: job.customer_phone,
      body: message,
      direction: "outbound",
      message_type: "status_notification"
    })

  } catch (error) {
    logger.error("Customer notification error:", error)
  }
}

// Helper: Log incoming message
async function logIncomingMessage(
  supabase: any,
  params: {
    from: string
    body: string
    messageSid: string
    technicianId: string | null
    jobId: string | null
    parsedAs: string
    keyword?: string | null
  }
): Promise<void> {
  try {
    await supabase.from("sms_logs").insert({
      job_id: params.jobId,
      technician_id: params.technicianId,
      from_number: params.from,
      to_number: process.env.TWILIO_PHONE_NUMBER || "",
      body: params.body,
      twilio_sid: params.messageSid,
      direction: "inbound",
      parsed_keyword: params.keyword || null,
      parsed_result: params.parsedAs,
      message_type: params.parsedAs.includes("status_update") ? "status_update" : 
                   params.parsedAs === "note" ? "note" : "general"
    })
  } catch (error) {
    logger.error("Error logging SMS message:", error)
  }
}
