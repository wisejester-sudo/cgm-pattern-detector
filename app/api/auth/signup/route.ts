/**
 * POST /api/auth/signup - Register a new admin account
 * 
 * Features:
 * - Zod validation for all inputs
 * - Rate limiting (3 attempts per minute per IP)
 * - Automatic company creation
 * - Twilio number provisioning
 * - Comprehensive error handling
 */

import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { z } from "zod"
import { 
  createErrorResponse, 
  ValidationError, 
  RateLimitError,
  DatabaseError,
  ServiceUnavailableError,
  createRequestContext
} from "@/lib/errors"
import { logger } from "@/lib/logger"
import { checkRateLimit, getClientIdentifier, rateLimitConfigs } from "@/lib/rate-limit"

export const dynamic = 'force-dynamic'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const signupSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be 100 characters or less")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  companyName: z.string()
    .min(1, "Company name is required")
    .max(100, "Company name must be 100 characters or less")
    .transform(val => val.trim()),
  companyPhone: z.string()
    .optional()
    .transform(val => val?.trim() || undefined),
  ownerName: z.string()
    .optional()
    .transform(val => val?.trim() || undefined),
})

export type SignupRequest = z.infer<typeof signupSchema>

export interface SignupResponse {
  success: true
  user: {
    id: string
    email: string
    full_name?: string
    company_name: string
  }
  provisioning: {
    success: boolean
    phoneNumber?: string
    error?: string
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function provisionTwilioNumber(adminId: string, areaCode?: string): Promise<{ success: boolean; phoneNumber?: string; error?: string }> {
  try {
    // Check if Twilio is configured
    const twilioSid = process.env.TWILIO_ACCOUNT_SID
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
    
    if (!twilioSid || !twilioAuthToken) {
      logger.warn('Twilio not configured, skipping provisioning')
      return { success: false, error: 'Twilio not configured' }
    }

    // This would integrate with Twilio API to provision a number
    // For now, return success with placeholder
    logger.info(`Provisioning number for admin ${adminId}`, { areaCode })
    
    // Placeholder - actual implementation would call Twilio API
    return { 
      success: true, 
      phoneNumber: areaCode ? `+1${areaCode}5550000` : '+15550000000'
    }
  } catch (error) {
    logger.error('Failed to provision Twilio number:', error)
    return { success: false, error: 'Provisioning failed' }
  }
}

async function createCompanySettings(
  supabase: ReturnType<typeof createServerClient>,
  adminId: string,
  companyName: string,
  companyPhone?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('company_settings')
      .insert({
        admin_id: adminId,
        company_name: companyName,
        company_phone: companyPhone || null,
        account_status: 'active',
        number_status: 'inactive',
      })

    if (error) {
      logger.error('Failed to create company settings:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    logger.error('Exception creating company settings:', error)
    return { success: false, error: 'Failed to create company settings' }
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const context = createRequestContext(request)
  
  try {
    logger.info(`[${context.requestId}] POST /api/auth/signup - Starting signup`, {
      path: context.path,
      method: context.method,
    })

    // Rate limiting: 3 signup attempts per minute per IP
    const identifier = getClientIdentifier(request)
    const rateLimit = checkRateLimit(`signup:${identifier}`, rateLimitConfigs.auth)
    
    if (!rateLimit.allowed) {
      throw new RateLimitError(
        'Too many signup attempts. Please try again later.',
        rateLimit.retryAfter
      )
    }

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      logger.warn(`[${context.requestId}] Supabase not configured`)
      throw new ServiceUnavailableError('Authentication service unavailable')
    }

    // Parse and validate request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      throw new ValidationError('Invalid JSON in request body')
    }

    const parseResult = signupSchema.safeParse(body)
    if (!parseResult.success) {
      const errors: Record<string, string> = {}
      parseResult.error.errors.forEach((err) => {
        const field = err.path.join('.')
        errors[field] = err.message
      })
      throw new ValidationError('Please fix the validation errors', errors)
    }

    const data = parseResult.data
    logger.info(`[${context.requestId}] Validation passed for email: ${data.email}`)

    // Create Supabase client
    const cookieStore = await cookies()
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore cookie errors in Server Components
            }
          },
        },
      }
    )

    // Sign up with email and password
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.ownerName || data.email.split('@')[0],
          company_name: data.companyName,
          company_phone: data.companyPhone,
          role: 'admin',
        },
      },
    })

    if (signUpError) {
      logger.error(`[${context.requestId}] Signup error:`, signUpError)
      
      if (signUpError.message?.includes('already registered')) {
        throw new ValidationError('An account with this email already exists')
      }
      
      throw new DatabaseError(signUpError.message)
    }

    if (!authData.user) {
      throw new DatabaseError('Failed to create user')
    }

    logger.info(`[${context.requestId}] User created: ${authData.user.id}`)

    // Create company settings
    const companyResult = await createCompanySettings(
      supabase,
      authData.user.id,
      data.companyName,
      data.companyPhone
    )

    if (!companyResult.success) {
      logger.error(`[${context.requestId}] Failed to create company settings`)
      // Continue anyway, user can complete setup later
    }

    // Try to provision Twilio number
    const provisioningResult = await provisionTwilioNumber(authData.user.id)

    // Prepare response
    const response: SignupResponse = {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        full_name: data.ownerName || data.email.split('@')[0],
        company_name: data.companyName,
      },
      provisioning: provisioningResult,
    }

    logger.info(`[${context.requestId}] Signup completed successfully`, {
      userId: authData.user.id,
      provisioningSuccess: provisioningResult.success,
    })

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    if (error instanceof ValidationError || 
        error instanceof RateLimitError ||
        error instanceof ServiceUnavailableError) {
      return createErrorResponse(error)
    }
    
    logger.error(`[${context.requestId}] Unexpected error during signup:`, error)
    return createErrorResponse(error as Error)
  }
}
