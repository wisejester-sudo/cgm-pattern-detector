import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/public/job/[token] - Get public job view by token
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      )
    }

    const { token } = await params
    const supabase = await createClient()

    // Find the public token
    const { data: publicToken, error: tokenError } = await supabase
      .from("public_job_tokens")
      .select("job_id, expires_at")
      .eq("token", token)
      .single()

    if (tokenError || !publicToken) {
      return NextResponse.json(
        { error: "Invalid or expired link" },
        { status: 404 }
      )
    }

    // Check expiration
    if (new Date(publicToken.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "This link has expired" },
        { status: 410 }
      )
    }

    // Fetch job details (limited public info)
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select(`
        id,
        job_type,
        status,
        updated_at,
        technician:technicians(name)
      `)
      .eq("id", publicToken.job_id)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    // Fetch job updates with photos
    const { data: updates } = await supabase
      .from("job_updates")
      .select("id, status, notes, photos, created_at")
      .eq("job_id", publicToken.job_id)
      .order("created_at", { ascending: false })

    // Fetch all photos
    const { data: photos } = await supabase
      .from("job_photos")
      .select("id, photo_url, thumbnail_url, caption, uploaded_at")
      .eq("job_id", publicToken.job_id)
      .order("uploaded_at", { ascending: false })

    // Fetch company branding
    const { data: settings } = await supabase
      .from("company_settings")
      .select("company_name, logo_url, primary_color, tagline")
      .single()

    return NextResponse.json({
      job: {
        id: job.id,
        job_type: job.job_type,
        status: job.status,
        technician_name: job.technician?.name || null,
        last_updated: job.updated_at,
      },
      updates: updates || [],
      photos: photos || [],
      company: settings || {
        company_name: "Service Provider",
        logo_url: null,
        primary_color: "#3b82f6",
        tagline: null,
      },
    })
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
