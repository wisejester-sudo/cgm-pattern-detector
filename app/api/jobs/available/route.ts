import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/jobs/available - Get all available jobs for technicians
export async function GET(request: NextRequest) {
  try {
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
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Fetch available jobs (status = 'available' and no assigned techs)
    const { data: jobs, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "available")
      .order("scheduled_time", { ascending: true })

    if (error) {
      console.error("[API] Error fetching available jobs:", error)
      return NextResponse.json(
        { error: "Failed to fetch available jobs" },
        { status: 500 }
      )
    }

    return NextResponse.json(jobs || [])
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
