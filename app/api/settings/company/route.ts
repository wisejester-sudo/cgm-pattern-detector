/**
 * Company Settings API
 * GET /api/settings/company - Get company settings
 * PATCH /api/settings/company - Update company settings
 * 
 * Features:
 * - Zod validation for all inputs
 * - Field whitelist for security
 * - Phone and email validation
 * - URL validation
 * - Comprehensive error handling
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import { 
  createErrorResponse, 
  ValidationError, 
  NotFoundError,
  DatabaseError,
  ServiceUnavailableError,
  AuthorizationError,
  createRequestContext
} from "@/lib/errors"
import { logger } from "@/lib/logger"

export const dynamic = 'force-dynamic'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const phoneRegex = /^\+?[\d\s\-\(\)]{10,20}$/
const colorRegex = /^#[0-9A-Fa-f]{6}$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const updateSettingsSchema = z.object({
  company_name: z.string()
    .min(1, "Company name is required")
    .max(100, "Company name must be 100 characters or less")
    .optional(),
  company_phone: z.string()
    .max(20, "Phone number is too long")
    .refine((val) => {
      if (!val) return true
      const digits = val.replace(/\D/g, '')
      return digits.length >= 10 && digits.length <= 15
    }, "Phone number must have 10-15 digits")
    .optional()
    .nullable(),
  company_email: z.string()
    .email("Please enter a valid email address")
    .max(255, "Email must be 255 characters or less")
    .optional()
    .nullable(),
  address: z.string()
    .max(200, "Address must be 200 characters or less")
    .optional()
    .nullable(),
  city: z.string()
    .max(100, "City must be 100 characters or less")
    .optional()
    .nullable(),
  state: z.string()
    .max(50, "State must be 50 characters or less")
    .optional()
    .nullable(),
  zip: z.string()
    .max(20, "ZIP code must be 20 characters or less")
    .optional()
    .nullable(),
  timezone: z.string()
    .max(50, "Timezone must be 50 characters or less")
    .optional(),
  logo_url: z.string()
    .url("Logo URL must be a valid URL")
    .max(500, "Logo URL is too long")
    .optional()
    .nullable(),
  primary_color: z.string()
    .regex(colorRegex, "Primary color must be in hex format (e.g., #3b82f6)")
    .optional(),
  owner_name: z.string()
    .max(100, "Owner name must be 100 characters or less")
    .optional()
    .nullable(),
  owner_phone: z.string()
    .max(20, "Phone number is too long")
    .optional()
    .nullable(),
  owner_email: z.string()
    .email("Please enter a valid email address")
    .max(255, "Email must be 255 characters or less")
    .optional()
    .nullable(),
})

// ============================================================================
// GET /api/settings/company
// ============================================================================

export async function GET(request: NextRequest) {
  const context = createRequestContext(request)
  
  try {
    logger.info(`[${context.requestId}] GET /api/settings/company - Fetching settings`, {
      path: context.path,
      method: context.method,
    })

    const supabase = await createClient()
    
    if (!supabase) {
      throw new ServiceUnavailableError('Database service unavailable')
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new AuthorizationError()
    }

    // Get company settings
    const { data: settings, error } = await supabase
      .from('company_settings')
      .select('*')
      .eq('admin_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, create default
        logger.info(`[${context.requestId}] No settings found, creating default for user ${user.id}`)
        
        const { data: newSettings, error: createError } = await supabase
          .from('company_settings')
          .insert({
            admin_id: user.id,
            company_name: user.user_metadata?.company_name || 'My Company',
            company_phone: user.user_metadata?.company_phone || null,
          })
          .select()
          .single()
        
        if (createError) {
          throw new DatabaseError('Failed to create company settings', createError)
        }
        
        return NextResponse.json({ success: true, settings: newSettings })
      }
      
      throw new DatabaseError('Failed to fetch company settings', error)
    }

    logger.info(`[${context.requestId}] Settings fetched successfully`)

    return NextResponse.json({ success: true, settings })

  } catch (error) {
    if (error instanceof ValidationError || 
        error instanceof AuthorizationError ||
        error instanceof NotFoundError ||
        error instanceof DatabaseError ||
        error instanceof ServiceUnavailableError) {
      return createErrorResponse(error)
    }
    
    logger.error(`[${context.requestId}] Unexpected error fetching settings:`, error)
    return createErrorResponse(error as Error)
  }
}

// ============================================================================
// PATCH /api/settings/company
// ============================================================================

export async function PATCH(request: NextRequest) {
  const context = createRequestContext(request)
  
  try {
    logger.info(`[${context.requestId}] PATCH /api/settings/company - Updating settings`, {
      path: context.path,
      method: context.method,
    })

    const supabase = await createClient()
    
    if (!supabase) {
      throw new ServiceUnavailableError('Database service unavailable')
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new AuthorizationError()
    }

    // Parse request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      throw new ValidationError('Invalid JSON in request body')
    }

    // Validate input
    const parseResult = updateSettingsSchema.safeParse(body)
    if (!parseResult.success) {
      const errors: Record<string, string> = {}
      parseResult.error.errors.forEach((err) => {
        const field = err.path.join('.')
        errors[field] = err.message
      })
      throw new ValidationError('Please fix the validation errors', errors)
    }

    const updates = parseResult.data
    logger.info(`[${context.requestId}] Updating settings for user ${user.id}`, {
      fields: Object.keys(updates),
    })

    // Add timestamp
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    }

    // Update settings
    const { data: settings, error } = await supabase
      .from('company_settings')
      .update(updateData)
      .eq('admin_id', user.id)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('Failed to update company settings', error)
    }

    logger.info(`[${context.requestId}] Settings updated successfully`)

    return NextResponse.json({ 
      success: true, 
      message: 'Settings updated successfully',
      settings 
    })

  } catch (error) {
    if (error instanceof ValidationError || 
        error instanceof AuthorizationError ||
        error instanceof DatabaseError ||
        error instanceof ServiceUnavailableError) {
      return createErrorResponse(error)
    }
    
    logger.error(`[${context.requestId}] Unexpected error updating settings:`, error)
    return createErrorResponse(error as Error)
  }
}
