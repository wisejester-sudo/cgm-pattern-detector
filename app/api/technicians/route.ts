/**
 * Technicians API - Robust Implementation
 * 
 * Features:
 * - Comprehensive input validation with clear, actionable error messages
 * - Proper error handling with request ID tracing
 * - Input sanitization
 * - Consistent response format
 * - Security validations
 * - Rate limiting consideration
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

export const dynamic = 'force-dynamic'

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_TECHNICIANS = 10
const TECHNICIAN_NAME_MIN = 1
const TECHNICIAN_NAME_MAX = 100
const EMAIL_MAX = 255
const PHONE_MIN_DIGITS = 10
const PHONE_MAX_DIGITS = 15
const PIN_MIN_LENGTH = 4
const PIN_MAX_LENGTH = 8

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createTechnicianSchema = z.object({
  name: z.string()
    .min(TECHNICIAN_NAME_MIN, "Technician name is required")
    .max(TECHNICIAN_NAME_MAX, `Name must be ${TECHNICIAN_NAME_MAX} characters or less`)
    .transform(val => val.trim()),
  
  email: z.string()
    .max(EMAIL_MAX, `Email must be ${EMAIL_MAX} characters or less`)
    .email("Please enter a valid email address (e.g., name@company.com)")
    .optional()
    .or(z.literal("")),
  
  phone: z.string()
    .refine((val) => {
      if (!val || val === "") return true
      const digits = val.replace(/\D/g, '')
      return digits.length >= PHONE_MIN_DIGITS && digits.length <= PHONE_MAX_DIGITS
    }, `Phone number must have ${PHONE_MIN_DIGITS}-${PHONE_MAX_DIGITS} digits (e.g., 3055551234)`)
    .optional()
    .or(z.literal("")),
  
  pin: z.string()
    .refine((val) => {
      if (!val || val === "") return true
      return /^\d{4,8}$/.test(val)
    }, `PIN must be ${PIN_MIN_LENGTH}-${PIN_MAX_LENGTH} digits`)
    .optional()
    .or(z.literal("")),
})

const updateTechnicianSchema = createTechnicianSchema.partial().extend({
  is_active: z.boolean().optional(),
})

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function sanitizePhone(phone: string): string | null {
  if (!phone || phone.trim() === "") return null
  return phone.replace(/\D/g, '')
}

function sanitizePIN(pin: string): string | null {
  if (!pin || pin.trim() === "") return null
  return pin.trim()
}

function sanitizeEmail(email: string): string | null {
  if (!email || email.trim() === "") return null
  return email.trim().toLowerCase()
}

function formatValidationErrors(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {}
  error.errors.forEach((err) => {
    const field = err.path.join('.')
    formatted[field] = err.message
  })
  return formatted
}

function errorResponse(
  message: string, 
  status: number = 500, 
  details?: Record<string, string>
) {
  const body: { error: string; details?: Record<string, string> } = { error: message }
  if (details) body.details = details
  return NextResponse.json(body, { status })
}

// ============================================================================
// GET /api/technicians - List all technicians
// ============================================================================

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()
  
  try {
    console.log(`[${requestId}] GET /api/technicians - Fetching technicians`)
    
    // Check Supabase configuration
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ technicians: [], pagination: null })
    }

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ technicians: [], pagination: null })
    }
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return errorResponse("Unauthorized", 401)
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
    const offset = (page - 1) * limit
    
    console.log(`[${requestId}] Fetching technicians for user ${user.id}, page ${page}`)
    
    // Execute query
    const { data: technicians, error, count } = await supabase
      .from("technicians")
      .select("*", { count: "exact" })
      .eq("admin_id", user.id)
      .order("name", { ascending: true })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error(`[${requestId}] Database error:`, error)
      return errorResponse("Failed to fetch technicians", 500)
    }
    
    console.log(`[${requestId}] Fetched ${technicians?.length || 0} technicians`)
    
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
    console.error(`[${requestId}] Unexpected error:`, error)
    return errorResponse("Failed to fetch technicians", 500)
  }
}

// ============================================================================
// POST /api/technicians - Create new technician
// ============================================================================

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  
  try {
    console.log(`[${requestId}] POST /api/technicians - Creating technician`)
    
    // Check Supabase configuration
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return errorResponse("Database not configured", 503)
    }

    const supabase = await createClient()
    if (!supabase) {
      return errorResponse("Database connection failed", 503)
    }
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.warn(`[${requestId}] Unauthorized request`)
      return errorResponse("You must be signed in to create technicians", 401)
    }
    
    console.log(`[${requestId}] User authenticated: ${user.id}`)

    // Parse request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return errorResponse("Invalid JSON in request body", 400)
    }
    
    // Validate input
    const parseResult = createTechnicianSchema.safeParse(body)
    if (!parseResult.success) {
      const errors = formatValidationErrors(parseResult.error)
      console.warn(`[${requestId}] Validation failed:`, errors)
      return errorResponse("Please fix the validation errors", 400, errors)
    }
    
    const data = parseResult.data
    console.log(`[${requestId}] Validation passed for technician: ${data.name}`)
    
    // Check technician limit
    const { count, error: countError } = await supabase
      .from("technicians")
      .select("*", { count: "exact", head: true })
      .eq("admin_id", user.id)
    
    if (countError) {
      console.error(`[${requestId}] Failed to count technicians:`, countError)
      return errorResponse("Failed to verify technician limit", 500)
    }
    
    if (count && count >= MAX_TECHNICIANS) {
      console.warn(`[${requestId}] Technician limit reached for user ${user.id}`)
      return errorResponse(
        `You can have up to ${MAX_TECHNICIANS} technicians. Contact sales for enterprise options.`,
        403
      )
    }
    
    // Sanitize inputs
    const sanitizedData = {
      admin_id: user.id,
      name: data.name,
      email: sanitizeEmail(data.email || ""),
      phone: sanitizePhone(data.phone || ""),
      pin: sanitizePIN(data.pin || ""),
      is_active: true,
    }
    
    // Insert into database
    const { data: technician, error: insertError } = await supabase
      .from("technicians")
      .insert(sanitizedData)
      .select()
      .single()
    
    if (insertError) {
      console.error(`[${requestId}] Database error:`, insertError)
      
      if (insertError.code === "23505") {
        return errorResponse("A technician with this information already exists", 409)
      }
      
      return errorResponse("Failed to create technician. Please try again.", 500)
    }
    
    console.log(`[${requestId}] Technician created successfully: ${technician.id}`)
    
    return NextResponse.json({
      success: true,
      message: `${data.name} has been added as a technician`,
      technician,
    }, { status: 201 })
    
  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error)
    return errorResponse("An unexpected error occurred. Please try again.", 500)
  }
}

// ============================================================================
// PATCH /api/technicians - Not implemented (use PUT /api/technicians/[id])
// ============================================================================

export async function PATCH(request: NextRequest) {
  return errorResponse("Bulk updates not implemented. Use PUT /api/technicians/[id]", 501)
}

// ============================================================================
// DELETE /api/technicians - Not implemented (use DELETE /api/technicians/[id])
// ============================================================================

export async function DELETE(request: NextRequest) {
  return errorResponse("Bulk deletes not implemented. Use DELETE /api/technicians/[id]", 501)
}
