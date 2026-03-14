import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST /api/jobs - Create a new job
export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      // Return 503 in demo mode - frontend will use local store
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

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
    const { 
      customer_name, 
      customer_phone, 
      customer_address, 
      job_type, 
      assigned_tech_id,
      scheduled_date,
      scheduled_time,
      notes 
    } = body

    // Validate required fields
    if (!customer_name || !customer_phone || !customer_address || !job_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Combine date and time into a single timestamp
    const scheduledDateTime = scheduled_date && scheduled_time 
      ? new Date(`${scheduled_date}T${scheduled_time}`)
      : new Date()

    // Create job in database
    const { data: job, error } = await supabase
      .from("jobs")
      .insert({
        admin_id: user.id,
        customer_name,
        customer_phone,
        customer_address,
        job_type,
        assigned_tech_id: assigned_tech_id || null,
        scheduled_time: scheduledDateTime.toISOString(),
        notes: notes || null,
        status: "scheduled",
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

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET /api/jobs - List all jobs for the current user
export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      // Return empty array in demo mode - frontend will use local store
      return NextResponse.json([])
    }

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json([])
    }
    
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

    let query = supabase
      .from("jobs")
      .select("*")
      .eq("admin_id", user.id)
      .order("scheduled_time", { ascending: true })

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

    return NextResponse.json(jobs)
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
