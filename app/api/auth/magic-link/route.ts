import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { randomBytes, createHash } from "crypto"

// POST /api/auth/magic-link - Generate magic link for technician
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check admin authentication
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
        { error: "technician_id is required" },
        { status: 400 }
      )
    }

    // Verify technician exists
    const { data: technician, error: techError } = await supabase
      .from("technicians")
      .select("id, name, is_active")
      .eq("id", technician_id)
      .single()

    if (techError || !technician) {
      return NextResponse.json(
        { error: "Technician not found" },
        { status: 404 }
      )
    }

    if (!technician.is_active) {
      return NextResponse.json(
        { error: "Technician is not active" },
        { status: 400 }
      )
    }

    // Generate token
    const token = randomBytes(32).toString("hex")
    const tokenHash = createHash("sha256").update(token).digest("hex")
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Delete any existing tokens for this technician
    await supabase
      .from("magic_tokens")
      .delete()
      .eq("technician_id", technician_id)

    // Store token hash
    const { error: insertError } = await supabase
      .from("magic_tokens")
      .insert({
        token_hash: tokenHash,
        technician_id,
        expires_at: expiresAt.toISOString(),
      })

    if (insertError) {
      console.error("[API] Error creating magic token:", insertError)
      return NextResponse.json(
        { error: "Failed to create magic link" },
        { status: 500 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const magicLink = `${baseUrl}/t/${token}`

    return NextResponse.json({
      magicLink,
      expires: "24h",
      technician_name: technician.name,
    })
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
