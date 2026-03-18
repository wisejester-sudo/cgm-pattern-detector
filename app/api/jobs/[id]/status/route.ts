import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendSMS, generatePhotoLink } from "@/lib/twilio"

const VALID_STATUSES = ["scheduled", "en_route", "working", "complete"]

// PATCH /api/jobs/[id]/status - Update job status
export async function PATCH(
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
    const { status, notes } = body

    // Validate status
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      )
    }

    // Get current job to check transition
    const { data: currentJob, error: fetchError } = await supabase
      .from("jobs")
      .select("status, assigned_tech_id")
      .eq("id", id)
      .single()

    if (fetchError || !currentJob) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    // Update job status
    const { data: job, error: updateError } = await supabase
      .from("jobs")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("[API] Error updating job status:", updateError)
      return NextResponse.json(
        { error: "Failed to update job status" },
        { status: 500 }
      )
    }

    // Create job update record
    const { data: updateRecord, error: updateRecordError } = await supabase
      .from("job_updates")
      .insert({
        job_id: id,
        status,
        notes: notes || `Status changed from ${currentJob.status} to ${status}`,
        photos: [],
        created_by_tech_id: currentJob.assigned_tech_id,
      })
      .select()
      .single()

    if (updateRecordError) {
      console.error("[API] Error creating update record:", updateRecordError)
      // Don't fail the request, status was updated successfully
    }

    // Send SMS notification for certain status changes
    let smsResult = null
    if (status === 'en_route' || status === 'complete') {
      // Get full job details
      const { data: jobDetails } = await supabase
        .from('jobs')
        .select('*, technicians(name)')
        .eq('id', id)
        .single()
      
      if (jobDetails) {
        // Get company settings
        const { data: settings } = await supabase
          .from('company_settings')
          .select('*')
          .eq('admin_id', user.id)
          .single()
        
        // Get template
        const templateName = status === 'en_route' ? 'En Route Notification' : 'Job Complete'
        const { data: template } = await supabase
          .from('sms_templates')
          .select('*')
          .eq('admin_id', user.id)
          .eq('name', templateName)
          .single()
        
        if (template && settings) {
          const photoLink = generatePhotoLink('job-photos', id)
          const techName = jobDetails.technicians?.name || 'Your technician'
          
          const messageBody = template.template_body
            .replace(/\{customer_name\}/g, jobDetails.customer_name)
            .replace(/\{tech_name\}/g, techName)
            .replace(/\{job_type\}/g, jobDetails.job_type)
            .replace(/\{address\}/g, jobDetails.customer_address)
            .replace(/\{company_name\}/g, settings.company_name)
            .replace(/\{company_phone\}/g, settings.company_phone)
            .replace(/\{eta\}/g, new Date(jobDetails.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
            .replace(/\{link\}/g, photoLink)
          
          smsResult = await sendSMS({
            to: jobDetails.customer_phone,
            body: messageBody,
          })
          
          // Log SMS
          await supabase.from('sms_logs').insert({
            job_id: id,
            recipient_phone: jobDetails.customer_phone,
            message_body: messageBody,
            status: smsResult.success ? 'sent' : 'failed',
            message_sid: smsResult.messageId,
          })
        }
      }
    }

    return NextResponse.json({ 
      job,
      update: updateRecord || null,
      sms: smsResult,
    })
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
