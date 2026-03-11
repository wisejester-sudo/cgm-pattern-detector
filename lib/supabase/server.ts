// Mock Supabase server client for demo mode
// To enable real Supabase auth, add the integration via v0 settings

export async function createClient() {
  // Return a mock client for demo mode
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
    },
    from: () => ({
      select: () => ({ data: null, error: new Error("Supabase not configured") }),
    }),
  } as any
}
