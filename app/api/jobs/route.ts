import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST /api/jobs - Create a new job
export async function POST(request: NextRequest) {
  try {
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
    const { 
      customer_name, 
      customer_phone, 
      address, 
      job_type, 
      technician_id,
      scheduled_time,
      notes 
    } = body

    // Validate required fields
    if (!customer_name || !customer_phone || !address || !job_type) {
      return NextResponse.json(
        { error: "Missing required fields: customer_name, customer_phone, address, job_type" },
        { status: 400 }
      )
    }

    // Create job in database
    const { data: job, error } = await supabase
      .from("jobs")
      .insert({
        customer_name,
        customer_phone,
        customer_address: address,
        job_type,
        assigned_tech_id: technician_id || null,
        scheduled_time: scheduled_time || new Date().toISOString(),
        notes: notes || null,
        status: "scheduled",
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("[API] Error creating job:", error)
      return NextResponse.json(
        { error: "Failed to create job" },
        { status: 500 }
      )
    }

    return NextResponse.json({ id: job.id, job }, { status: 201 })
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET /api/jobs - List all jobs
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const technicianId = searchParams.get("technician_id")

    let query = supabase.from("jobs").select("*").order("scheduled_time", { ascending: true })

    if (status) {
      query = query.eq("status", status)
    }

    if (technicianId) {
      query = query.eq("assigned_tech_id", technicianId)
    }

    const { data: jobs, error } = await query

    if (error) {
      console.error("[API] Error fetching jobs:", error)
      return NextResponse.json(
        { error: "Failed to fetch jobs" },
        { status: 500 }
      )
    }

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
