import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

    return NextResponse.json({ 
      job,
      update: updateRecord || null,
    })
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
