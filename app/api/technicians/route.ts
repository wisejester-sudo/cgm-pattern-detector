import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/technicians - List all technicians for current admin
export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json([])
    }

    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { data: technicians, error } = await supabase
      .from("technicians")
      .select("*")
      .eq("admin_id", user.id)
      .order("name", { ascending: true })

    if (error) {
      console.error("[API] Error fetching technicians:", error)
      return NextResponse.json(
        { error: "Failed to fetch technicians" },
        { status: 500 }
      )
    }

    return NextResponse.json(technicians)
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/technicians - Create new technician
export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      )
    }

    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, email, phone, pin } = body

    if (!name) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      )
    }

    const { data: technician, error } = await supabase
      .from("technicians")
      .insert({
        admin_id: user.id,
        name,
        email: email || null,
        phone: phone || null,
        pin: pin || null,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("[API] Error creating technician:", error)
      return NextResponse.json(
        { error: "Failed to create technician" },
        { status: 500 }
      )
    }

    return NextResponse.json(technician, { status: 201 })
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
