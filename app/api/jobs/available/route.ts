import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/jobs/available - Get all available jobs for the current admin
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

    // Parse pagination params
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)))
    const offset = (page - 1) * limit

    // SECURITY: Only fetch jobs belonging to the authenticated admin
    // This prevents unauthorized access to other users' jobs
    const { data: jobs, error, count } = await supabase
      .from("jobs")
      .select("*", { count: "exact" })
      .eq("admin_id", user.id)
      .eq("status", "available")
      .order("scheduled_time", { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("[API] Error fetching available jobs:", error)
      return NextResponse.json(
        { error: "Failed to fetch available jobs" },
        { status: 500 }
      )
    }

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
