import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendSMS, generatePhotoLink } from "@/lib/twilio"
import { renderSMSTemplate, getTemplateForStatus } from "@/lib/sms-templates"
import { randomBytes } from "crypto"

// POST /api/jobs/[id]/updates - Create a job update and send SMS
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      )
    }

    const { id } = await params
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status, notes, photos = [], send_sms = true } = body

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select(`
        *,
        technician:technicians(id, name, phone)
      `)
      .eq("id", id)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    // Update job status if provided
    if (status) {
      await supabase
        .from("jobs")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
    }

    // Create job update record
    const { data: updateRecord, error: updateError } = await supabase
      .from("job_updates")
      .insert({
        job_id: id,
        status: status || job.status,
        notes: notes || null,
        photos: photos,
        created_by_tech_id: job.assigned_tech_id,
      })
      .select()
      .single()

    if (updateError) {
      console.error("[API] Error creating update:", updateError)
      return NextResponse.json(
        { error: "Failed to create update" },
        { status: 500 }
      )
    }

    // Send SMS to customer if enabled
    let smsResult = null
    if (send_sms && job.customer_phone) {
      // Generate public viewer token
      const token = randomBytes(16).toString("hex")
      const photoLink = generatePhotoLink(token)

      // Store the public token
      await supabase
        .from("public_job_tokens")
        .insert({
          token,
          job_id: id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        })

      // Get company settings
      const { data: settings } = await supabase
        .from("company_settings")
        .select("company_name")
        .single()

      // Generate SMS message
      const templateType = getTemplateForStatus(status || job.status)
      const message = renderSMSTemplate(templateType, {
        techName: job.technician?.name,
        link: photoLink,
        companyName: settings?.company_name || "Your service provider",
      })

      // Send SMS
      smsResult = await sendSMS({
        to: job.customer_phone,
        body: message,
        mediaUrls: photos.length > 0 ? photos.slice(0, 3) : undefined, // Twilio supports up to 10 media
      })

      // Log SMS
      await supabase
        .from("sms_logs")
        .insert({
          job_id: id,
          recipient_phone: job.customer_phone,
          message_body: message,
          status: smsResult.success ? "sent" : "failed",
          message_sid: smsResult.messageId || null,
        })
    }

    return NextResponse.json({
      update_id: updateRecord.id,
      update: updateRecord,
      sms_sent: smsResult?.success || false,
    }, { status: 201 })
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET /api/jobs/[id]/updates - Get all updates for a job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ updates: [] })
    }
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { data: updates, error } = await supabase
      .from("job_updates")
      .select(`
        *,
        technician:technicians(id, name)
      `)
      .eq("job_id", id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[API] Error fetching updates:", error)
      return NextResponse.json(
        { error: "Failed to fetch updates" },
        { status: 500 }
      )
    }

    return NextResponse.json({ updates })
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
