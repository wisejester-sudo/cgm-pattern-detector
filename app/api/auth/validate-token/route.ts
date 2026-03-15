import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST /api/auth/validate-token - Validate magic link token
export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { valid: false, error: "Database not configured" },
        { status: 503 }
      )
    }

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ valid: false, error: "Database not configured" }, { status: 503 })
    }
    
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      )
    }

    // Look up technician by magic link token
    const { data: technician, error: tokenError } = await supabase
      .from("technicians")
      .select("*")
      .eq("magic_link_token", token)
      .eq("is_active", true)
      .single()

    if (tokenError || !technician) {
      return NextResponse.json(
        { valid: false, error: "Invalid token" },
        { status: 401 }
      )
    }

    // Check expiration - try both column names for compatibility
    const expiresAt = technician.token_expires_at || technician.magic_link_expires_at
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return NextResponse.json(
        { valid: false, error: "Token has expired" },
        { status: 401 }
      )
    }

    // Record first access if not already recorded
    const updates: any = { last_active_at: new Date().toISOString() }
    if (!technician.accessed_at) {
      updates.accessed_at = new Date().toISOString()
    }
    
    await supabase
      .from("technicians")
      .update(updates)
      .eq("id", technician.id)

    return NextResponse.json({
      valid: true,
      name: technician.name,
      technician: {
        id: technician.id,
        name: technician.name,
        email: technician.email,
        phone: technician.phone,
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
