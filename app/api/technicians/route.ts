import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/technicians - List all technicians for current admin with pagination
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
    
    // PERFORMANCE: Pagination support
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
    const offset = (page - 1) * limit

    const { data: technicians, error, count } = await supabase
      .from("technicians")
      .select("*", { count: "exact" })
      .eq("admin_id", user.id)
      .order("name", { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("[API] Error fetching technicians:", error)
      return NextResponse.json(
        { error: "Failed to fetch technicians" },
        { status: 500 }
      )
    }

    // PERFORMANCE: Return pagination metadata
    return NextResponse.json({
      technicians: technicians || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
        hasMore: count ? offset + (technicians?.length || 0) < count : false,
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
    const { name, email, phone, pin } = body

    if (!name) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      )
    }
    
    // SECURITY: Validate email format if provided
    if (email !== undefined && email !== null) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        )
      }
    }
    
    // SECURITY: Validate phone number format if provided
    if (phone !== undefined && phone !== null) {
      // Normalize and validate phone (should be 10+ digits)
      const normalizedPhone = phone.replace(/\D/g, '')
      if (normalizedPhone.length < 10 || normalizedPhone.length > 15) {
        return NextResponse.json(
          { error: "Invalid phone number format" },
          { status: 400 }
        )
      }
    }
    
    // SECURITY: Validate PIN format if provided
    if (pin !== undefined && pin !== null) {
      if (!/^\d{4,8}$/.test(pin)) {
        return NextResponse.json(
          { error: "PIN must be 4-8 digits" },
          { status: 400 }
        )
      }
    }

    // Check technician limit (10 max, including deactivated)
    const { count, error: countError } = await supabase
      .from("technicians")
      .select("*", { count: "exact", head: true })
      .eq("admin_id", user.id)

    if (countError) {
      console.error("[API] Error counting technicians:", countError)
      return NextResponse.json(
        { error: "Failed to verify technician limit" },
        { status: 500 }
      )
    }

    if (count && count >= 10) {
      return NextResponse.json(
        { error: "Technician limit reached. You can have up to 10 technicians total (including deactivated). Contact sales@getdispatchly.co for enterprise options." },
        { status: 403 }
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
