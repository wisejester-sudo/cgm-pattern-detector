import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createHash } from "crypto"

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
    
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      )
    }

    // Hash the token for lookup
    const tokenHash = createHash("sha256").update(token).digest("hex")

    // Find the token
    const { data: magicToken, error: tokenError } = await supabase
      .from("magic_tokens")
      .select(`
        *,
        technician:technicians(id, name, email, phone, is_active)
      `)
      .eq("token_hash", tokenHash)
      .single()

    if (tokenError || !magicToken) {
      return NextResponse.json(
        { valid: false, error: "Invalid token" },
        { status: 401 }
      )
    }

    // Check expiration
    if (new Date(magicToken.expires_at) < new Date()) {
      // Delete expired token
      await supabase
        .from("magic_tokens")
        .delete()
        .eq("id", magicToken.id)

      return NextResponse.json(
        { valid: false, error: "Token has expired" },
        { status: 401 }
      )
    }

    // Check if technician is still active
    if (!magicToken.technician?.is_active) {
      return NextResponse.json(
        { valid: false, error: "Technician is no longer active" },
        { status: 401 }
      )
    }

    // Extend token expiration (auto-refresh on use)
    const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await supabase
      .from("magic_tokens")
      .update({ expires_at: newExpiresAt.toISOString() })
      .eq("id", magicToken.id)

    // Update technician last login
    await supabase
      .from("technicians")
      .update({ last_login: new Date().toISOString() })
      .eq("id", magicToken.technician_id)

    return NextResponse.json({
      valid: true,
      technician: {
        id: magicToken.technician.id,
        name: magicToken.technician.name,
        email: magicToken.technician.email,
        phone: magicToken.technician.phone,
      },
      expires_at: newExpiresAt.toISOString(),
    })
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
