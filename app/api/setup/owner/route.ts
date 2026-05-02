import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ownerName, ownerPhone, companyPhone } = body

    if (!ownerName || !ownerPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update auth.users metadata with full_name and role
    const { error: updateAuthError } = await supabase.auth.updateUser({
      data: {
        full_name: ownerName,
        role: 'admin',
      }
    })

    if (updateAuthError) {
      console.error('[API] Error updating auth metadata:', updateAuthError)
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      )
    }

    // Update company settings with owner info and mark setup as complete
    const { error: updateError } = await supabase
      .from('company_settings')
      .update({
        owner_name: ownerName,
        owner_phone: ownerPhone,
        setup_completed: true,
      })
      .eq('admin_id', user.id)

    if (updateError) {
      console.error('[API] Error saving owner info:', updateError)
      return NextResponse.json(
        { error: 'Failed to save owner information' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: ownerName,
        phone: ownerPhone,
      }
    })
  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
