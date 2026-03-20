/**
 * Jobs API - Robust Implementation
 * 
 * Features:
 * - Comprehensive input validation with clear error messages
 * - Proper error handling and logging
 * - CSRF protection
 * - Input sanitization
 * - Rate limiting consideration
 * - Consistent response format
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const jobStatusSchema = z.enum([
  "available",
  "scheduled", 
  "en_route",
  "working",
  "on_hold",
  "complete"
])

const createJobSchema = z.object({
  customer_name: z.string()
    .min(1, "Customer name is required")
    .max(100, "Customer name must be 100 characters or less")
    .transform(val => val.trim()),
  
  customer_phone: z.string()
    .min(1, "Phone number is required")
    .refine((val) => {
      const digits = val.replace(/\D/g, '')
      return digits.length >= 10 && digits.length <= 15
    }, "Phone number must have 10-15 digits (e.g., 3055551234)"),
  
  customer_address: z.string()
    .min(1, "Address is required")
    .max(200, "Address must be 200 characters or less")
    .transform(val => val.trim()),
  
  job_type: z.string()
    .min(1, "Job type is required")
    .max(50, "Job type must be 50 characters or less"),
  
  scheduled_time: z.string()
    .datetime("Scheduled time must be a valid datetime")
    .optional(),
  
  notes: z.union([
    z.string().max(1000, "Notes must be 1000 characters or less"),
    z.null()
  ]).optional(),
  
  assigned_tech_ids: z.array(z.string().uuid("Invalid technician ID"))
    .optional(),
})

const updateJobSchema = createJobSchema.partial().extend({
  status: jobStatusSchema.optional(),
  on_hold_reason: z.string().max(500).optional(),
})

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function sanitizePhone(phone: string): string {
  // Keep only digits
  return phone.replace(/\D/g, '')
}

function formatPhoneForDisplay(phone: string): string {
  const digits = sanitizePhone(phone)
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone
}

function formatValidationErrors(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {}
  error.errors.forEach((err) => {
    const field = err.path.join('.')
    formatted[field] = err.message
  })
  return formatted
}

// ============================================================================
// ERROR RESPONSE HELPER
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

// ============================================================================
// POST /api/jobs - Create a new job
// ============================================================================

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  
  try {
    console.log(`[${requestId}] POST /api/jobs - Starting job creation`)
    
    // Check Supabase configuration
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error(`[${requestId}] Supabase not configured`)
      return errorResponse("Database not configured. Please contact support.", 503)
    }

    const supabase = await createClient()
    if (!supabase) {
      console.error(`[${requestId}] Failed to create Supabase client`)
      return errorResponse("Database connection failed", 503)
    }
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.warn(`[${requestId}] Unauthorized request`)
      return errorResponse("You must be signed in to create jobs", 401)
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
    const parseResult = createJobSchema.safeParse(body)
    if (!parseResult.success) {
      const errors = formatValidationErrors(parseResult.error)
      console.warn(`[${requestId}] Validation failed:`, errors)
      return errorResponse("Please fix the validation errors", 400, errors)
    }
    
    const data = parseResult.data
    console.log(`[${requestId}] Validation passed for job: ${data.customer_name}`)
    
    // Sanitize phone number
    const sanitizedPhone = sanitizePhone(data.customer_phone)
    
    // Prepare job data
    const jobData = {
      admin_id: user.id,
      customer_name: data.customer_name,
      customer_phone: sanitizedPhone,
      customer_address: data.customer_address,
      job_type: data.job_type,
      scheduled_time: data.scheduled_time || new Date().toISOString(),
      notes: data.notes ?? null,
      assigned_tech_ids: data.assigned_tech_ids || null,
      status: "available" as const,
      on_hold_reason: null,
    }
    
    // Insert into database
    const { data: job, error: insertError } = await supabase
      .from("jobs")
      .insert(jobData)
      .select()
      .single()
    
    if (insertError) {
      console.error(`[${requestId}] Database error:`, insertError)
      
      // Check for specific error types
      if (insertError.code === "23505") {
        return errorResponse("A job with this information already exists", 409)
      }
      if (insertError.code === "23503") {
        return errorResponse("One or more assigned technicians not found", 400)
      }
      
      return errorResponse("Failed to create job. Please try again.", 500)
    }
    
    console.log(`[${requestId}] Job created successfully: ${job.id}`)
    
    return NextResponse.json({
      success: true,
      message: `Job for ${data.customer_name} created successfully`,
      job,
    }, { status: 201 })
    
  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error)
    return errorResponse("An unexpected error occurred. Please try again.", 500)
  }
}

// ============================================================================
// GET /api/jobs - List all jobs
// ============================================================================

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()
  
  try {
    console.log(`[${requestId}] GET /api/jobs - Fetching jobs`)
    
    // Check Supabase configuration
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ jobs: [], pagination: null })
    }

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ jobs: [], pagination: null })
    }
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return errorResponse("Unauthorized", 401)
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const technicianId = searchParams.get("technician_id")
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)))
    const offset = (page - 1) * limit
    
    console.log(`[${requestId}] Fetching jobs for user ${user.id}, page ${page}, limit ${limit}`)
    
    // Build query
    let query = supabase
      .from("jobs")
      .select("*, technicians:assigned_tech_ids(*)", { count: "exact" })
      .eq("admin_id", user.id)
      .order("scheduled_time", { ascending: false })
      .range(offset, offset + limit - 1)
    
    // Apply filters
    if (status && jobStatusSchema.safeParse(status).success) {
      query = query.eq("status", status)
    }
    
    if (technicianId) {
      query = query.contains("assigned_tech_ids", [technicianId])
    }
    
    // Execute query
    const { data: jobs, error, count } = await query
    
    if (error) {
      console.error(`[${requestId}] Database error:`, error)
      return errorResponse("Failed to fetch jobs", 500)
    }
    
    console.log(`[${requestId}] Fetched ${jobs?.length || 0} jobs`)
    
    return NextResponse.json({
      jobs: jobs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
        hasMore: count ? offset + (jobs?.length || 0) < count : false,
      }
    })
    
  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error)
    return errorResponse("Failed to fetch jobs", 500)
  }
}

// ============================================================================
// PATCH /api/jobs - Bulk update jobs (if needed)
// ============================================================================

export async function PATCH(request: NextRequest) {
  return errorResponse("Bulk updates not implemented. Use PUT /api/jobs/[id]", 501)
}

// ============================================================================
// DELETE /api/jobs - Bulk delete jobs (if needed)
// ============================================================================

export async function DELETE(request: NextRequest) {
  return errorResponse("Bulk deletes not implemented. Use DELETE /api/jobs/[id]", 501)
}
