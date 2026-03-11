// Mock Supabase client for demo mode
// To enable real Supabase auth, add the integration via v0 settings

export function createClient() {
  // Return a mock client for demo mode
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: new Error("Demo mode - Supabase not configured") }),
      signUp: async () => ({ data: null, error: new Error("Demo mode - Supabase not configured") }),
      signOut: async () => ({ error: null }),
    },
    from: () => ({
      select: () => ({ data: null, error: new Error("Supabase not configured") }),
      insert: () => ({ data: null, error: new Error("Supabase not configured") }),
      update: () => ({ data: null, error: new Error("Supabase not configured") }),
      delete: () => ({ data: null, error: new Error("Supabase not configured") }),
    }),
  } as any
}
