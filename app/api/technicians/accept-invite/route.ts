import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }
    const body = await request.json()
    const { token, pin } = body

    if (!token || !pin) {
      return NextResponse.json(
        { error: 'Missing token or PIN' },
        { status: 400 }
      )
    }

    // Find technician by token
    const { data: technician, error: fetchError } = await supabase
      .from('technicians')
      .select('*')
      .eq('magic_link_token', token)
      .single()

    if (fetchError || !technician) {
      return NextResponse.json(
        { error: 'Invalid or expired invite link' },
        { status: 401 }
      )
    }

    // Check if token has expired
    if (technician.magic_link_expires_at && new Date(technician.magic_link_expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Invite link has expired' },
        { status: 401 }
      )
    }

    // Update technician with PIN and mark as accepted
    const { error: updateError } = await supabase
      .from('technicians')
      .update({
        pin: pin,
        invite_accepted_at: new Date().toISOString(),
        magic_link_token: null,
        magic_link_expires_at: null,
        is_active: true,
      })
      .eq('id', technician.id)

    if (updateError) {
      console.error('[API] Error accepting invite:', updateError)
      return NextResponse.json(
        { error: 'Failed to accept invite' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      technician: {
        id: technician.id,
        name: technician.name,
      },
    })
  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
