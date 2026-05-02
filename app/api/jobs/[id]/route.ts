/**
 * Individual Job API - Robust Implementation
 * 
 * Features:
 * - GET /api/jobs/[id] - Fetch job details with ownership verification
 * - PATCH /api/jobs/[id] - Update job with validation
 * - DELETE /api/jobs/[id] - Delete job with ownership verification
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

export const dynamic = 'force-dynamic'

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

const updateJobSchema = z.object({
  customer_name: z.string()
    .min(1, "Customer name is required")
    .max(100, "Customer name must be 100 characters or less")
    .transform(val => val.trim())
    .optional(),
  
  customer_phone: z.string()
    .refine((val) => {
      const digits = val.replace(/\D/g, '')
      return digits.length >= 10 && digits.length <= 15
    }, "Phone number must have 10-15 digits")
    .optional(),
  
  customer_address: z.string()
    .min(1, "Address is required")
    .max(200, "Address must be 200 characters or less")
    .transform(val => val.trim())
    .optional(),
  
  job_type: z.string()
    .min(1, "Job type is required")
    .max(50, "Job type must be 50 characters or less")
    .optional(),
  
  scheduled_time: z.string()
    .datetime("Scheduled time must be a valid ISO datetime")
    .optional(),
  
  notes: z.string()
    .max(1000, "Notes must be 1000 characters or less")
    .nullable()
    .optional(),
  
  assigned_tech_ids: z.array(z.string().uuid("Invalid technician ID"))
    .optional(),
  
  status: jobStatusSchema.optional(),
  
  on_hold_reason: z.string()
    .max(500, "On-hold reason must be 500 characters or less")
    .nullable()
    .optional(),
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

// ============================================================================
// GET /api/jobs/[id] - Get job details
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID()
  
  try {
    console.log(`[${requestId}] GET /api/jobs/[id] - Fetching job details`)
    
    const { id } = await params
    
    // Validate UUID format
    if (!z.string().uuid().safeParse(id).success) {
      return errorResponse("Invalid job ID format", 400)
    }
    
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
      return errorResponse("Unauthorized", 401)
    }

    console.log(`[${requestId}] Fetching job ${id} for user ${user.id}`)
    
    // Fetch job with ownership verification
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select(`*, technicians:assigned_tech_ids(id, name, phone)`)
      .eq("id", id)
      .eq("admin_id", user.id)
      .single()

    if (jobError || !job) {
      // Return 404 without revealing if job exists but belongs to another user
      console.warn(`[${requestId}] Job ${id} not found for user ${user.id}`)
      return errorResponse("Job not found", 404)
    }
    
    console.log(`[${requestId}] Job fetched successfully`)
    
    // Fetch recent updates
    const { data: updates } = await supabase
      .from("job_updates")
      .select("*")
      .eq("job_id", id)
      .order("created_at", { ascending: false })
      .limit(10)
    
    // Fetch photos
    const { data: photos } = await supabase
      .from("job_photos")
      .select("*")
      .eq("job_id", id)
      .order("uploaded_at", { ascending: false })
    
    return NextResponse.json({
      success: true,
      job,
      updates: updates || [],
      photos: photos || [],
    })
    
  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error)
    return errorResponse("Failed to fetch job details", 500)
  }
}

// ============================================================================
// PATCH /api/jobs/[id] - Update job
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID()
  
  try {
    console.log(`[${requestId}] PATCH /api/jobs/[id] - Updating job`)
    
    const { id } = await params
    
    // Validate UUID format
    if (!z.string().uuid().safeParse(id).success) {
      return errorResponse("Invalid job ID format", 400)
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
    
    console.log(`[${requestId}] User ${user.id} updating job ${id}`)
    
    // Verify job exists and belongs to the authenticated user
    const { data: existingJob, error: verifyError } = await supabase
      .from("jobs")
      .select("id")
      .eq("id", id)
      .eq("admin_id", user.id)
      .single()
    
    if (verifyError || !existingJob) {
      console.warn(`[${requestId}] Job ${id} not found for user ${user.id}`)
      return errorResponse("Job not found", 404)
    }
    
    // Parse request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return errorResponse("Invalid JSON in request body", 400)
    }
    
    // Validate input
    const parseResult = updateJobSchema.safeParse(body)
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
    
    // Prepare updates
    const updates: Record<string, unknown> = {
      ...data,
      updated_at: new Date().toISOString(),
    }
    
    // Update job with ownership check
    const { data: job, error: updateError } = await supabase
      .from("jobs")
      .update(updates)
      .eq("id", id)
      .eq("admin_id", user.id)
      .select()
      .single()
    
    if (updateError) {
      console.error(`[${requestId}] Database error:`, updateError)
      return errorResponse("Failed to update job", 500)
    }
    
    console.log(`[${requestId}] Job updated successfully`)
    
    return NextResponse.json({
      success: true,
      message: "Job updated successfully",
      job,
    })
    
  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error)
    return errorResponse("Failed to update job", 500)
  }
}

// ============================================================================
// DELETE /api/jobs/[id] - Delete job
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID()
  
  try {
    console.log(`[${requestId}] DELETE /api/jobs/[id] - Deleting job`)
    
    const { id } = await params
    
    // Validate UUID format
    if (!z.string().uuid().safeParse(id).success) {
      return errorResponse("Invalid job ID format", 400)
    }
    
    // Check Supabase configuration
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
      return errorResponse("Unauthorized", 401)
    }
    
    console.log(`[${requestId}] User ${user.id} deleting job ${id}`)
    
    // Delete job with ownership check
    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", id)
      .eq("admin_id", user.id)
    
    if (error) {
      console.error(`[${requestId}] Database error:`, error)
      return errorResponse("Failed to delete job", 500)
    }
    
    console.log(`[${requestId}] Job deleted successfully`)
    
    return NextResponse.json({
      success: true,
      message: "Job deleted successfully",
    })
    
  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error)
    return errorResponse("Failed to delete job", 500)
  }
}
