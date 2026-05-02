/**
 * GET /api/auth/session - Get current session info
 * 
 * Features:
 * - Returns current user session if valid
 * - Returns 401 if not authenticated
 * - Request ID tracking
 * - Comprehensive error handling
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { 
  createErrorResponse,
  AuthenticationError,
  ServiceUnavailableError,
  createRequestContext
} from "@/lib/errors"
import { logger } from "@/lib/logger"

export const dynamic = 'force-dynamic'

export interface SessionResponse {
  success: true
  user: {
    id: string
    email: string
    full_name?: string
    company_name?: string
    company_phone?: string
    role?: string
  }
  session: {
    expires_at: number
  }
}

export interface SessionErrorResponse {
  success: false
  authenticated: false
}

export async function GET(request: NextRequest) {
  const context = createRequestContext(request)
  
  try {
    logger.info(`[${context.requestId}] GET /api/auth/session - Checking session`, {
      path: context.path,
      method: context.method,
    })

    const supabase = await createClient()
    
    if (!supabase) {
      throw new ServiceUnavailableError('Authentication service unavailable')
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      logger.info(`[${context.requestId}] No active session`)
      return NextResponse.json(
        { success: false, authenticated: false },
        { status: 401 }
      )
    }

    // Get session info
    const { data: { session } } = await supabase.auth.getSession()

    logger.info(`[${context.requestId}] Session valid: ${user.id}`)

    const response: SessionResponse = {
      success: true,
      user: {
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name,
        company_name: user.user_metadata?.company_name,
        company_phone: user.user_metadata?.company_phone,
        role: user.user_metadata?.role || 'admin',
      },
      session: {
        expires_at: session?.expires_at || Math.floor(Date.now() / 1000) + 3600,
      },
    }

    return NextResponse.json(response)

  } catch (error) {
    if (error instanceof ServiceUnavailableError) {
      return createErrorResponse(error)
    }
    
    logger.error(`[${context.requestId}] Unexpected error checking session:`, error)
    return createErrorResponse(error as Error)
  }
}
