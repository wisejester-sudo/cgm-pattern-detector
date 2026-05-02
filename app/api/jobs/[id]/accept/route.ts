import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

// POST /api/jobs/[id]/accept - Accept an available job
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    const { technician_id } = body

    if (!technician_id) {
      return NextResponse.json(
        { error: "Technician ID is required" },
        { status: 400 }
      )
    }

    // Verify the technician belongs to the current user
    const { data: technician, error: techError } = await supabase
      .from("technicians")
      .select("id, company_id, admin_id")
      .eq("id", technician_id)
      .eq("admin_id", user.id)
      .single()

    if (techError || !technician) {
      return NextResponse.json(
        { error: "Technician not found" },
        { status: 404 }
      )
    }

    // SECURITY: Get the current job with ownership verification
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*, companies!inner(admin_id)")
      .eq("id", id)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    // Verify the user owns this job through the company
    if (job.companies?.admin_id !== user.id) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    // Update the job: add technician to assigned_tech_ids and change status to scheduled
    // First, get current assigned_tech_ids or initialize empty array
    const currentTechIds = job.assigned_tech_ids || []
    
    // Add the new technician if not already assigned
    if (!currentTechIds.includes(technician_id)) {
      currentTechIds.push(technician_id)
    }

    const { data: updatedJob, error: updateError } = await supabase
      .from("jobs")
      .update({
        status: "scheduled",
        assigned_tech_ids: currentTechIds,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("[API] Error accepting job:", updateError)
      return NextResponse.json(
        { error: "Failed to accept job" },
        { status: 500 }
      )
    }

    // Send SMS notification to customer
    let smsResult = null
    try {
      // Get company settings for SMS
      const { data: company } = await supabase
        .from("companies")
        .select("*")
        .eq("id", job.company_id)
        .single()

      if (company && company.company_phone) {
        // This would integrate with your SMS service
        // For now, we'll just return success
        smsResult = {
          success: true,
          messageId: null,
        }
      }
    } catch (smsError) {
      console.error("[API] SMS notification failed:", smsError)
      smsResult = {
        success: false,
        error: smsError instanceof Error ? smsError.message : "SMS failed",
      }
    }

    return NextResponse.json({
      job: updatedJob,
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
