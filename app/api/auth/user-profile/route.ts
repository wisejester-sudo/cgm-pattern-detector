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
    console.log('[API] Fetching profile for user:', user.id)
    const { data: profile, error } = await supabase
      .from('users')
      .select('id, name, email, phone, role, company_name, created_at')
      .eq('id', user.id)
      .single()

    if (error) {
      console.log('[API] Profile not found, returning auth user data:', error.message)
      // Return basic user data from auth if no profile row exists
      return NextResponse.json({
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email,
        phone: user.user_metadata?.phone || null,
        role: 'admin',
        company_name: null,
        created_at: user.created_at,
      })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/auth/user-profile - Update current user profile
export async function PATCH(request: NextRequest) {
  console.log('[API] PATCH /api/auth/user-profile called')
  try {
    const supabase = await createClient()
    if (!supabase) {
      console.error('[API] Supabase client not created')
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    console.log('[API] Getting current user...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('[API] Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('[API] User authenticated:', user.id)

    let body
    try {
      body = await request.json()
    } catch (e) {
      console.error('[API] Failed to parse request body:', e)
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    
    const { name, phone, email } = body
    console.log('[API] Update requested:', { name, phone, email: email ? 'provided' : 'not provided' })

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
      console.log('[API] Updating auth email...')
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
      console.log('[API] Auth email updated successfully')
    }

    // Check if users table exists and has row for this user
    console.log('[API] Checking if user exists in users table...')
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (checkError) {
      console.log('[API] User not found in users table, creating...', checkError.message)
      // Insert new user row with ALL provided updates
      const insertData: any = {
        id: user.id,
        email: email || user.email, // Use new email if provided, else keep current
        name: name || user.user_metadata?.name || user.email?.split('@')[0],
        phone: phone || null,
        role: 'admin',
        company_name: null,
        created_at: new Date().toISOString(),
      }
      
      console.log('[API] Inserting new profile:', insertData)
      
      const { data: newProfile, error: insertError } = await supabase
        .from('users')
        .insert(insertData)
        .select()
        .single()

      if (insertError) {
        console.error('[API] Error creating user profile:', insertError)
        return NextResponse.json({ error: `Failed to create profile: ${insertError.message}` }, { status: 500 })
      }

      console.log('[API] User profile created successfully:', newProfile)
      return NextResponse.json({
        success: true,
        profile: newProfile,
        message: 'Profile created successfully',
      })
    }

    // Update existing user profile
    console.log('[API] Updating existing user profile...')
    const { data: profile, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('[API] Error updating profile:', error)
      return NextResponse.json({ error: `Failed to update profile: ${error.message}` }, { status: 500 })
    }

    console.log('[API] Profile updated successfully')
    return NextResponse.json({
      success: true,
      profile,
      message: 'Profile updated successfully',
    })
  } catch (error: any) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}
