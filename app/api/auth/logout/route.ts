/**
 * POST /api/auth/logout - Sign out user and clear session
 * 
 * Features:
 * - Clear Supabase session
 * - Remove auth cookies
 * - Request ID tracking
 * - Comprehensive error handling
 */

import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { 
  createErrorResponse,
  ServiceUnavailableError,
  createRequestContext
} from "@/lib/errors"
import { logger } from "@/lib/logger"

export const dynamic = 'force-dynamic'

export interface LogoutResponse {
  success: true
  message: string
}

export async function POST(request: NextRequest) {
  const context = createRequestContext(request)
  
  try {
    logger.info(`[${context.requestId}] POST /api/auth/logout - Starting logout`, {
      path: context.path,
      method: context.method,
    })

    // Check environment configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new ServiceUnavailableError('Authentication service unavailable')
    }

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

    // Sign out
    const { error } = await supabase.auth.signOut()

    if (error) {
      logger.error(`[${context.requestId}] Logout error:`, error)
      // Continue anyway, we'll clear cookies client-side
    }

    logger.info(`[${context.requestId}] Logout successful`)

    const response: LogoutResponse = {
      success: true,
      message: 'Logged out successfully',
    }

    return NextResponse.json(response)

  } catch (error) {
    if (error instanceof ServiceUnavailableError) {
      return createErrorResponse(error)
    }
    
    logger.error(`[${context.requestId}] Unexpected error during logout:`, error)
    return createErrorResponse(error as Error)
  }
}

// Also support GET for convenience
export async function GET(request: NextRequest) {
  return POST(request)
}
