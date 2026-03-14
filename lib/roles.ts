import { createClient } from '@/lib/supabase/server'

export type UserRole = 'admin' | 'technician' | 'none'

export async function getUserRole(userId?: string): Promise<UserRole> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return 'none'
    }

    const supabase = await createClient()
    if (!supabase) {
      return 'none'
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return 'none'
    }

    // Check if user is an admin (has company_settings entry)
    const { data: company } = await supabase
      .from('company_settings')
      .select('id')
      .eq('admin_id', user.id)
      .single()

    if (company) {
      return 'admin'
    }

    // Check if user is a technician
    const { data: technician } = await supabase
      .from('technicians')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (technician) {
      return 'technician'
    }

    return 'none'
  } catch (error) {
    console.error('[Roles] Error determining user role:', error)
    return 'none'
  }
}

export async function requireRole(requiredRole: UserRole) {
  const role = await getUserRole()

  if (requiredRole === 'admin' && role !== 'admin') {
    throw new Error('Unauthorized: Admin access required')
  }

  if (requiredRole === 'technician' && role !== 'technician') {
    throw new Error('Unauthorized: Technician access required')
  }

  return role
}
