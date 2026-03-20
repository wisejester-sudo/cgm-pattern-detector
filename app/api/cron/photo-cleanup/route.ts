import { NextRequest, NextResponse } from "next/server"
import { cleanupOldPhotos } from "@/lib/photo-cleanup"

/**
 * POST /api/cron/photo-cleanup
 * Trigger photo cleanup job - deletes photos older than 45 days
 * Should be called by a cron job (e.g., daily at 2 AM)
 * 
 * Authorization: Requires CRON_SECRET header for security
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization")
    const expectedSecret = process.env.CRON_SECRET

    // CRON_SECRET must be set in production
    if (!expectedSecret) {
      return NextResponse.json(
        { error: "CRON_SECRET not configured" },
        { status: 503 }
      )
    }

    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log("[API] Starting photo cleanup job")
    const result = await cleanupOldPhotos()

    return NextResponse.json({
      success: true,
      deleted: result.deleted,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[API] Photo cleanup job failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cron/photo-cleanup
 * Health check endpoint - returns count of photos that would be deleted
 * Does not perform any deletions
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization")
    const expectedSecret = process.env.CRON_SECRET

    // CRON_SECRET must be set in production
    if (!expectedSecret) {
      return NextResponse.json(
        { error: "CRON_SECRET not configured" },
        { status: 503 }
      )
    }

    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      )
    }

    // Calculate cutoff date
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 45)

    // Just count - don't delete
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase client not available" },
        { status: 503 }
      )
    }

    const { count, error } = await supabase
      .from("photos")
      .select("*", { count: "exact", head: true })
      .lt("created_at", cutoffDate.toISOString())

    if (error) {
      return NextResponse.json(
        { error: `Failed to count photos: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      photosToDelete: count || 0,
      cutoffDate: cutoffDate.toISOString(),
      retentionDays: 45,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[API] Health check failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
