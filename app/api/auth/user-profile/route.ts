import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/auth/user-profile - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile from users table
    const { data: profile, error } = await supabase
      .from('users')
      .select('id, name, email, phone, role, company_name, created_at')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('[API] Error fetching profile:', error)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/auth/user-profile - Update current user profile
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, email } = body

    // Validate at least one field is provided
    if (!name && !phone && !email) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    // Build update object
    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (phone !== undefined) updates.phone = phone
    if (email !== undefined) updates.email = email

    // Update user in Supabase Auth (for email changes)
    if (email && email !== user.email) {
      const { error: authUpdateError } = await supabase.auth.updateUser({
        email: email,
      })
      if (authUpdateError) {
        console.error('[API] Error updating auth email:', authUpdateError)
        return NextResponse.json(
          { error: `Failed to update email: ${authUpdateError.message}` },
          { status: 400 }
        )
      }
    }

    // Update user profile in database
    const { data: profile, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('[API] Error updating profile:', error)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      profile,
      message: 'Profile updated successfully',
    })
  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
