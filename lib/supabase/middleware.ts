// Mock Supabase middleware client for demo mode
// To enable real Supabase auth, add the integration via v0 settings

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function createMiddlewareClient(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Mock supabase client for demo mode
  const supabase = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
    },
  }

  return { supabase, response }
}
