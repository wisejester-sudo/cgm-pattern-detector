/**
 * Individual Technician API - Robust Implementation
 * 
 * Features:
 * - GET /api/technicians/[techId] - Fetch technician details
 * - PUT /api/technicians/[techId] - Update technician with validation
 * - DELETE /api/technicians/[techId] - Delete technician
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

export const dynamic = 'force-dynamic'

// ============================================================================
// CONSTANTS
// ============================================================================

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

const updateTechnicianSchema = z.object({
  name: z.string()
    .min(TECHNICIAN_NAME_MIN, "Technician name is required")
    .max(TECHNICIAN_NAME_MAX, `Name must be ${TECHNICIAN_NAME_MAX} characters or less`)
    .transform(val => val.trim())
    .optional(),
  
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
    }, `Phone number must have ${PHONE_MIN_DIGITS}-${PHONE_MAX_DIGITS} digits`)
    .optional()
    .or(z.literal("")),
  
  pin: z.string()
    .refine((val) => {
      if (!val || val === "") return true
      return /^\d{4,8}$/.test(val)
    }, `PIN must be ${PIN_MIN_LENGTH}-${PIN_MAX_LENGTH} digits`)
    .optional()
    .or(z.literal("")),
  
  is_active: z.boolean().optional(),
})

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function errorResponse(
  message: string, 
  status: number = 500, 
  details?: Record<string, string>
) {
  const body: { error: string; details?: Record<string, string> } = { error: message }
  if (details) body.details = details
  return NextResponse.json(body, { status })
}

function formatValidationErrors(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {}
  error.errors.forEach((err) => {
    const field = err.path.join('.')
    formatted[field] = err.message
  })
  return formatted
}

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

// ============================================================================
// GET /api/technicians/[techId] - Get technician details
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ techId: string }> }
) {
  const requestId = crypto.randomUUID()
  
  try {
    console.log(`[${requestId}] GET /api/technicians/[techId] - Fetching technician`)
    
    const { techId } = await params
    
    // Validate UUID format
    if (!z.string().uuid().safeParse(techId).success) {
      return errorResponse("Invalid technician ID format", 400)
    }
    
    const supabase = await createClient()
    if (!supabase) {
      return errorResponse("Database connection failed", 503)
    }
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return errorResponse("Unauthorized", 401)
    }
    
    console.log(`[${requestId}] Fetching technician ${techId} for user ${user.id}`)
    
    // Fetch technician with ownership verification
    const { data: technician, error } = await supabase
      .from("technicians")
      .select("*")
      .eq("id", techId)
      .eq("admin_id", user.id)
      .single()
    
    if (error || !technician) {
      console.warn(`[${requestId}] Technician ${techId} not found for user ${user.id}`)
      return errorResponse("Technician not found", 404)
    }
    
    console.log(`[${requestId}] Technician fetched successfully`)
    
    return NextResponse.json({
      success: true,
      technician,
    })
    
  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error)
    return errorResponse("Failed to fetch technician", 500)
  }
}

// ============================================================================
// PUT /api/technicians/[techId] - Update technician
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ techId: string }> }
) {
  const requestId = crypto.randomUUID()
  
  try {
    console.log(`[${requestId}] PUT /api/technicians/[techId] - Updating technician`)
    
    const { techId } = await params
    
    // Validate UUID format
    if (!z.string().uuid().safeParse(techId).success) {
      return errorResponse("Invalid technician ID format", 400)
    }
    
    const supabase = await createClient()
    if (!supabase) {
      return errorResponse("Database connection failed", 503)
    }
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return errorResponse("Unauthorized", 401)
    }
    
    console.log(`[${requestId}] User ${user.id} updating technician ${techId}`)
    
    // Verify technician exists and belongs to user
    const { data: existingTech, error: verifyError } = await supabase
      .from("technicians")
      .select("id")
      .eq("id", techId)
      .eq("admin_id", user.id)
      .single()
    
    if (verifyError || !existingTech) {
      console.warn(`[${requestId}] Technician ${techId} not found for user ${user.id}`)
      return errorResponse("Technician not found", 404)
    }
    
    // Parse request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return errorResponse("Invalid JSON in request body", 400)
    }
    
    // Validate input
    const parseResult = updateTechnicianSchema.safeParse(body)
    if (!parseResult.success) {
      const errors = formatValidationErrors(parseResult.error)
      console.warn(`[${requestId}] Validation failed:`, errors)
      return errorResponse("Please fix the validation errors", 400, errors)
    }
    
    const data = parseResult.data
    
    // Ensure at least one field is being updated
    if (Object.keys(data).length === 0) {
      return errorResponse("No valid fields to update", 400)
    }
    
    console.log(`[${requestId}] Updating fields:`, Object.keys(data).join(", "))
    
    // Prepare updates with sanitization
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    
    if (data.name !== undefined) updates.name = data.name
    if (data.email !== undefined) updates.email = sanitizeEmail(data.email || "")
    if (data.phone !== undefined) updates.phone = sanitizePhone(data.phone || "")
    if (data.pin !== undefined) updates.pin = sanitizePIN(data.pin || "")
    if (data.is_active !== undefined) updates.is_active = data.is_active
    
    // Update technician with ownership check
    const { data: technician, error: updateError } = await supabase
      .from("technicians")
      .update(updates)
      .eq("id", techId)
      .eq("admin_id", user.id)
      .select()
      .single()
    
    if (updateError) {
      console.error(`[${requestId}] Database error:`, updateError)
      
      if (updateError.code === "23505") {
        return errorResponse("A technician with this information already exists", 409)
      }
      
      return errorResponse("Failed to update technician", 500)
    }
    
    console.log(`[${requestId}] Technician updated successfully`)
    
    return NextResponse.json({
      success: true,
      message: `${data.name || "Technician"} updated successfully`,
      technician,
    })
    
  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error)
    return errorResponse("Failed to update technician", 500)
  }
}

// ============================================================================
// DELETE /api/technicians/[techId] - Delete technician
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ techId: string }> }
) {
  const requestId = crypto.randomUUID()
  
  try {
    console.log(`[${requestId}] DELETE /api/technicians/[techId] - Deleting technician`)
    
    const { techId } = await params
    
    // Validate UUID format
    if (!z.string().uuid().safeParse(techId).success) {
      return errorResponse("Invalid technician ID format", 400)
    }
    
    const supabase = await createClient()
    if (!supabase) {
      return errorResponse("Database connection failed", 503)
    }
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return errorResponse("Unauthorized", 401)
    }
    
    console.log(`[${requestId}] User ${user.id} deleting technician ${techId}`)
    
    // Delete technician with ownership check
    const { error } = await supabase
      .from("technicians")
      .delete()
      .eq("id", techId)
      .eq("admin_id", user.id)
    
    if (error) {
      console.error(`[${requestId}] Database error:`, error)
      return errorResponse("Failed to delete technician", 500)
    }
    
    console.log(`[${requestId}] Technician deleted successfully`)
    
    return NextResponse.json({
      success: true,
      message: "Technician deleted successfully",
    })
    
  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error)
    return errorResponse("Failed to delete technician", 500)
  }
}
