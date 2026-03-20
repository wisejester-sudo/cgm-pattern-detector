import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ProfileUpdateData, UserProfileInsertData } from '@/lib/types'

// GET /api/auth/user-profile - Get current user profile
export async function GET(request: NextRequest) {
  console.log('[API] ========== GET /api/auth/user-profile START ==========')
  const startTime = Date.now()
  
  try {
    console.log('[API] Step 1: Creating Supabase client...')
    const step1Start = Date.now()
    const supabase = await createClient()
    console.log('[API] Step 1 complete in', Date.now() - step1Start, 'ms')
    
    if (!supabase) {
      console.log('[API] ERROR: Supabase not configured')
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }
    console.log('[API] Supabase client created successfully')

    console.log('[API] Step 2: Getting user from auth...')
    const step2Start = Date.now()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('[API] Step 2 complete in', Date.now() - step2Start, 'ms')
    
    if (authError) {
      console.log('[API] ERROR: Auth error:', authError.message)
      return NextResponse.json({ error: 'Unauthorized', details: authError.message }, { status: 401 })
    }
    
    if (!user) {
      console.log('[API] ERROR: No user found')
      return NextResponse.json({ error: 'Unauthorized', details: 'No user' }, { status: 401 })
    }
    
    console.log('[API] User authenticated:', user.id)

    console.log('[API] Step 3: Querying users table...')
    const step3Start = Date.now()
    const { data: profile, error } = await supabase
      .from('users')
      .select('id, full_name, email, phone, role, company_name, created_at')
      .eq('id', user.id)
      .maybeSingle() // Changed from .single() to .maybeSingle() to avoid errors
    console.log('[API] Step 3 complete in', Date.now() - step3Start, 'ms')

    if (error) {
      console.log('[API] WARNING: Profile query error:', error.message)
      console.log('[API] Returning auth user data as fallback')
      // Return basic user data from auth if no profile row exists
      return NextResponse.json({
        id: user.id,
        full_name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email,
        phone: user.user_metadata?.phone || null,
        role: 'admin',
        company_name: null,
        created_at: user.created_at,
      })
    }

    if (!profile) {
      console.log('[API] No profile found, returning auth user data')
      return NextResponse.json({
        id: user.id,
        full_name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email,
        phone: user.user_metadata?.phone || null,
        role: 'admin',
        company_name: null,
        created_at: user.created_at,
      })
    }

    console.log('[API] Profile found, returning:', profile.full_name)
    console.log('[API] ========== COMPLETE in', Date.now() - startTime, 'ms ==========')
    return NextResponse.json(profile)
  } catch (error: unknown) {
    console.error('[API] ========== UNEXPECTED ERROR ==========')
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('[API] Error:', errorMessage)
    if (errorStack) console.error('[API] Stack:', errorStack)
    console.error('[API] Time elapsed before error:', Date.now() - startTime, 'ms')
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: errorMessage 
    }, { status: 500 })
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
    const updates: ProfileUpdateData = {}
    if (name !== undefined) updates.full_name = name
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

    // Check if user exists in users table
    console.log('[API] Checking if user exists in users table...')
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (checkError) {
      console.error('[API] Error checking for existing user:', checkError)
      return NextResponse.json({ error: `Database error: ${checkError.message}` }, { status: 500 })
    }

    if (!existingUser) {
      console.log('[API] User not found in users table, creating...')
      // Insert new user row with ALL provided updates
      const insertData: UserProfileInsertData = {
        id: user.id,
        email: email || user.email || '',
        full_name: name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
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

      console.log('[API] User profile created successfully')
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
  } catch (error: unknown) {
    console.error('[API] Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'Internal server error',
      details: errorMessage
    }, { status: 500 })
  }
}
