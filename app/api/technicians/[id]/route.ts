import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// DELETE /api/technicians/[id] - Delete technician
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ success: true })
    }

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ success: true })
    }
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { error } = await supabase
      .from("technicians")
      .delete()
      .eq("id", id)
      .eq("admin_id", user.id) // Ensure user can only delete their own technicians

    if (error) {
      console.error("[API] Error deleting technician:", error)
      return NextResponse.json(
        { error: "Failed to delete technician" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH /api/technicians/[id] - Update technician
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const allowedFields = [
      "name",
      "email",
      "phone",
      "pin",
      "is_active",
    ]

    // Filter to only allowed fields
    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      )
    }

    updates.updated_at = new Date().toISOString()

    const { data: technician, error } = await supabase
      .from("technicians")
      .update(updates)
      .eq("id", id)
      .eq("admin_id", user.id) // Ensure user can only update their own technicians
      .select()
      .single()

    if (error) {
      console.error("[API] Error updating technician:", error)
      return NextResponse.json(
        { error: "Failed to update technician" },
        { status: 500 }
      )
    }

    return NextResponse.json({ technician })
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
