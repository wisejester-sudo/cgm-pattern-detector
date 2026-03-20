import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { validationSchemas, validateAndSanitize, checkBodySize, MAX_BODY_SIZES } from "@/lib/validation"
import { ErrorResponses } from "@/lib/errors"

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

    // Check request body size
    const sizeError = checkBodySize(request, MAX_BODY_SIZES.json)
    if (sizeError) return sizeError

    const body = await request.json()
    
    // Validate and sanitize input
    const { errors, sanitized } = validateAndSanitize(body, validationSchemas.createJob)
    
    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 }
      )
    }
    
    const { 
      customer_name, 
      customer_phone, 
      customer_address, 
      job_type, 
      assigned_tech_ids,
      scheduled_date,
      scheduled_time,
      notes 
    } = sanitized as typeof body

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
    // Handle both single tech_id (backward compatibility) and array
    const techIds = assigned_tech_ids 
      ? (Array.isArray(assigned_tech_ids) ? assigned_tech_ids : [assigned_tech_ids]) 
      : null
    
    const { data: job, error } = await supabase
      .from("jobs")
      .insert({
        admin_id: user.id,
        customer_name,
        customer_phone,
        customer_address,
        job_type,
        assigned_tech_ids: techIds,
        scheduled_time: scheduledDateTime.toISOString(),
        notes: notes || null,
        status: "available", // New jobs start as available
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

// GET /api/jobs - List all jobs for the current user with pagination
export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
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
    
    // PERFORMANCE: Pagination support
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10))) // Max 100 items per page
    const offset = (page - 1) * limit

    let query = supabase
      .from("jobs")
      .select("*", { count: "exact" })
      .eq("admin_id", user.id)
      .order("scheduled_time", { ascending: true })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq("status", status)
    }

    if (technicianId) {
      // Filter jobs where technicianId is in the assigned_tech_ids array
      query = query.contains("assigned_tech_ids", [technicianId])
    }

    const { data: jobs, error, count } = await query

    if (error) {
      console.error("[API] Error fetching jobs:", error)
      return NextResponse.json(
        { error: "Failed to fetch jobs" },
        { status: 500 }
      )
    }

    // PERFORMANCE: Return pagination metadata
    return NextResponse.json({
      jobs: jobs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
        hasMore: count ? offset + (jobs?.length || 0) < count : false,
      }
    })
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
