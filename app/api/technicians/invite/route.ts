import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

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
    const { technicianId } = body

    if (!technicianId) {
      return NextResponse.json(
        { error: 'Missing technician ID' },
        { status: 400 }
      )
    }

    // Generate magic link token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Update technician with magic link token
    const { error: updateError } = await supabase
      .from('technicians')
      .update({
        magic_link_token: token,
        magic_link_expires_at: expiresAt.toISOString(),
      })
      .eq('id', technicianId)
      .eq('admin_id', user.id)

    if (updateError) {
      console.error('[API] Error generating magic link:', updateError)
      return NextResponse.json(
        { error: 'Failed to generate invite link' },
        { status: 500 }
      )
    }

    // Get the technician to retrieve email/phone for sending
    const { data: technician, error: fetchError } = await supabase
      .from('technicians')
      .select('*')
      .eq('id', technicianId)
      .single()

    if (fetchError || !technician) {
      return NextResponse.json(
        { error: 'Technician not found' },
        { status: 404 }
      )
    }

    // TODO: Send SMS/email with magic link
    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/t/${token}`

    return NextResponse.json({
      success: true,
      magicLink,
      technician,
    })
  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
