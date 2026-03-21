import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/sms - Fetch SMS logs
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ smsLogs: [] })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get("job_id")

    let query = supabase
      .from("sms_logs")
      .select("*")
      .order("sent_at", { ascending: true })

    if (jobId) {
      query = query.eq("job_id", jobId)
    }

    const { data: smsLogs, error } = await query

    if (error) {
      console.error("Error fetching SMS logs:", error)
      return NextResponse.json({ error: "Failed to fetch SMS logs" }, { status: 500 })
    }

    return NextResponse.json({ smsLogs: smsLogs || [] })
  } catch (error) {
    console.error("Error in GET /api/sms:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/sms - Send SMS
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { job_id, recipient_phone, message_body, sender_name, sender_type } = body

    if (!job_id || !recipient_phone || !message_body) {
      return NextResponse.json(
        { error: "Missing required fields: job_id, recipient_phone, message_body" },
        { status: 400 }
      )
    }

    // Insert into database with sender info
    const { data: smsLog, error } = await supabase
      .from("sms_logs")
      .insert({
        job_id,
        recipient_phone,
        message_body,
        status: "sent",
        direction: "outbound",
        sender_name: sender_name || "Business",
        sender_type: sender_type || "admin",
        sender_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving SMS log:", error)
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "SMS sent successfully",
      smsLog,
    })
  } catch (error) {
    console.error("Error in POST /api/sms:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
