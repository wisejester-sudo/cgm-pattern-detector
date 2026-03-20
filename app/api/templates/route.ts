import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/templates - List all SMS templates for current admin
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

    const { data: templates, error } = await supabase
      .from("sms_templates")
      .select("*")
      .eq("admin_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[API] Error fetching templates:", error)
      return NextResponse.json(
        { error: "Failed to fetch templates" },
        { status: 500 }
      )
    }

    return NextResponse.json(templates)
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/templates - Create new SMS template
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
    const { name, template_body } = body

    if (!name || !template_body) {
      return NextResponse.json(
        { error: "Missing required fields: name, template_body" },
        { status: 400 }
      )
    }
    
    // SECURITY: Validate and sanitize template name
    if (typeof name !== 'string' || name.length < 1 || name.length > 100) {
      return NextResponse.json(
        { error: "Template name must be between 1 and 100 characters" },
        { status: 400 }
      )
    }
    
    // SECURITY: Validate template body length
    if (typeof template_body !== 'string' || template_body.length < 1 || template_body.length > 500) {
      return NextResponse.json(
        { error: "Template body must be between 1 and 500 characters" },
        { status: 400 }
      )
    }
    
    // SECURITY: Sanitize template name to prevent XSS
    const sanitizedName = name
      .replace(/[<>]/g, '') // Remove angle brackets
      .trim()
    
    // SECURITY: Sanitize template body - only allow specific template variables
    // Pattern: {customer_name}, {address}, {job_type}, etc.
    const allowedVariables = [
      'customer_name', 'address', 'job_type', 'tech_name', 
      'company_name', 'company_phone', 'eta', 'scheduled_time'
    ]
    const variablePattern = /\{([^}]+)\}/g
    const foundVariables = [...template_body.matchAll(variablePattern)].map(m => m[1])
    const invalidVariables = foundVariables.filter(v => !allowedVariables.includes(v))
    
    if (invalidVariables.length > 0) {
      return NextResponse.json(
        { error: `Invalid template variables: ${invalidVariables.join(', ')}. Allowed: ${allowedVariables.join(', ')}` },
        { status: 400 }
      )
    }

    const { data: template, error } = await supabase
      .from("sms_templates")
      .insert({
        admin_id: user.id,
        name,
        template_body,
      })
      .select()
      .single()

    if (error) {
      console.error("[API] Error creating template:", error)
      return NextResponse.json(
        { error: "Failed to create template" },
        { status: 500 }
      )
    }

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
