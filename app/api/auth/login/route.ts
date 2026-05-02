/**
 * POST /api/auth/login - Authenticate user with email and password
 * 
 * Features:
 * - Zod validation for credentials
 * - Rate limiting (5 attempts per minute per IP)
 * - Session management with cookies
 * - Comprehensive error handling
 * - Request ID tracking
 */

import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { z } from "zod"
import { 
  createErrorResponse, 
  ValidationError, 
  RateLimitError,
  AuthenticationError,
  ServiceUnavailableError,
  createRequestContext
} from "@/lib/errors"
import { logger } from "@/lib/logger"
import { checkRateLimit, getClientIdentifier, rateLimitConfigs } from "@/lib/rate-limit"

export const dynamic = 'force-dynamic'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const loginSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string()
    .min(1, "Password is required")
    .max(100, "Password must be 100 characters or less"),
})

export type LoginRequest = z.infer<typeof loginSchema>

export interface LoginResponse {
  success: true
  user: {
    id: string
    email: string
    full_name?: string
    company_name?: string
    company_phone?: string
  }
  session?: {
    expires_at: number
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const context = createRequestContext(request)
  
  try {
    logger.info(`[${context.requestId}] POST /api/auth/login - Starting login`, {
      path: context.path,
      method: context.method,
    })

    // Rate limiting: 5 login attempts per minute per IP
    const identifier = getClientIdentifier(request)
    const rateLimit = checkRateLimit(`login:${identifier}`, rateLimitConfigs.auth)
    
    if (!rateLimit.allowed) {
      throw new RateLimitError(
        'Too many login attempts. Please try again later.',
        rateLimit.retryAfter
      )
    }

    // Check environment configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
    
    if (!supabaseUrl || !supabaseAnonKey) {
      if (demoMode) {
        logger.warn(`[${context.requestId}] Running in DEMO MODE`)
        return NextResponse.json({ 
          success: true, 
          demo: true,
          user: {
            id: 'demo-user',
            email: 'demo@dispatchly.co',
            full_name: 'Demo User',
            company_name: 'Demo Company',
          }
        })
      }
      throw new ServiceUnavailableError('Authentication service unavailable')
    }

    // Parse and validate request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      throw new ValidationError('Invalid JSON in request body')
    }

    const parseResult = loginSchema.safeParse(body)
    if (!parseResult.success) {
      const errors: Record<string, string> = {}
      parseResult.error.errors.forEach((err) => {
        const field = err.path.join('.')
        errors[field] = err.message
      })
      throw new ValidationError('Please fix the validation errors', errors)
    }

    const data = parseResult.data
    logger.info(`[${context.requestId}] Login attempt for email: ${data.email}`)

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
              // Ignore cookie errors
            }
          },
        },
      }
    )

    // Sign in with email and password
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (signInError) {
      logger.warn(`[${context.requestId}] Login failed:`, { 
        email: data.email, 
        error: signInError.message 
      })
      
      if (signInError.message?.includes('Invalid login credentials')) {
        throw new AuthenticationError('Invalid email or password')
      }
      
      if (signInError.message?.includes('Email not confirmed')) {
        throw new AuthenticationError('Please confirm your email before signing in')
      }
      
      throw new AuthenticationError(signInError.message)
    }

    if (!authData.user) {
      throw new AuthenticationError('Login failed')
    }

    logger.info(`[${context.requestId}] Login successful: ${authData.user.id}`)

    // Prepare response
    const response: LoginResponse = {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        full_name: authData.user.user_metadata?.full_name,
        company_name: authData.user.user_metadata?.company_name,
        company_phone: authData.user.user_metadata?.company_phone,
      },
    }

    // Include session info if available
    if (authData.session) {
      response.session = {
        expires_at: authData.session.expires_at!,
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    if (error instanceof ValidationError || 
        error instanceof RateLimitError ||
        error instanceof AuthenticationError ||
        error instanceof ServiceUnavailableError) {
      return createErrorResponse(error)
    }
    
    logger.error(`[${context.requestId}] Unexpected error during login:`, error)
    return createErrorResponse(error as Error)
  }
}
