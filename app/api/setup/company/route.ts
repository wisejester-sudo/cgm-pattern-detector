import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { companyName, companyPhone, companyAddress } = body

    if (!companyName || !companyPhone || !companyAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update or create company settings
    const { error } = await supabase
      .from('company_settings')
      .upsert({
        admin_id: user.id,
        company_name: companyName,
        company_phone: companyPhone,
        address: companyAddress,
        setup_completed: false,
      }, { onConflict: 'admin_id' })
      .select()
      .single()

    if (error) {
      console.error('[API] Error saving company info:', error)
      return NextResponse.json(
        { error: 'Failed to save company information' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
