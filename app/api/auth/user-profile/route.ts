import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get company settings to find owner name
    const { data: companySettings, error: settingsError } = await supabase
      .from('company_settings')
      .select('owner_name, owner_phone')
      .eq('admin_id', user.id)
      .single()

    const profile = {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || companySettings?.owner_name || null,
      phone: user.user_metadata?.phone || companySettings?.owner_phone || null,
      role: user.user_metadata?.role || 'admin' as const,
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('[API] Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}
