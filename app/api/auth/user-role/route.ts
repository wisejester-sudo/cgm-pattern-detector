import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ role: 'none' })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ role: 'none' })
    }

    // Check if user is an admin
    const { data: company } = await supabase
      .from('company_settings')
      .select('*')
      .eq('admin_id', user.id)
      .single()

    if (company) {
      return NextResponse.json({
        role: 'admin',
        user: {
          id: user.id,
          email: user.email,
          company: {
            name: company.company_name,
            phone: company.company_phone,
            address: company.address,
            owner_name: company.owner_name,
            owner_phone: company.owner_phone,
            setup_completed: company.setup_completed,
          },
        },
      })
    }

    // Check if user is a technician
    const { data: technician } = await supabase
      .from('technicians')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()

    if (technician) {
      return NextResponse.json({
        role: 'technician',
        user: {
          id: user.id,
          email: user.email,
          technician: {
            id: technician.id,
            name: technician.name,
            phone: technician.phone,
            is_active: technician.is_active,
          },
        },
      })
    }

    return NextResponse.json({ role: 'none' })
  } catch (error) {
    console.error('[API] Error getting user role:', error)
    return NextResponse.json({ role: 'none' }, { status: 500 })
  }
}
