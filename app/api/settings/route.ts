import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// GET /api/settings - Get company settings for logged-in user
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

    // Get company settings for this admin
    const { data: settings, error } = await supabase
      .from('company_settings')
      .select('*')
      .eq('admin_id', user.id)
      .single()

    if (error) {
      logger.error('Error fetching settings:', error)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    return NextResponse.json(settings)
  } catch (error) {
    logger.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/settings - Update company settings
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
    
    // SECURITY: Whitelist allowed fields to prevent mass assignment vulnerabilities
    const allowedFields = [
      'company_name',
      'company_phone',
      'company_email',
      'address',
      'city',
      'state',
      'zip',
      'logo_url',
      'primary_color',
      'tagline',
      'website',
      'timezone',
      'owner_name',
      'owner_phone',
      'owner_email',
    ]
    
    // Filter to only allowed fields
    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }
    
    // Validate phone numbers if provided
    if (updates.company_phone && typeof updates.company_phone === 'string') {
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,20}$/
      if (!phoneRegex.test(updates.company_phone)) {
        return NextResponse.json(
          { error: 'Invalid company_phone format' },
          { status: 400 }
        )
      }
    }
    
    if (updates.owner_phone && typeof updates.owner_phone === 'string') {
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,20}$/
      if (!phoneRegex.test(updates.owner_phone)) {
        return NextResponse.json(
          { error: 'Invalid owner_phone format' },
          { status: 400 }
        )
      }
    }
    
    // Validate email if provided
    if (updates.company_email && typeof updates.company_email === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(updates.company_email)) {
        return NextResponse.json(
          { error: 'Invalid company_email format' },
          { status: 400 }
        )
      }
    }
    
    // Validate URL fields if provided
    if (updates.logo_url && typeof updates.logo_url === 'string') {
      try {
        const url = new URL(updates.logo_url)
        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('Invalid protocol')
        }
      } catch {
        return NextResponse.json(
          { error: 'Invalid logo_url format' },
          { status: 400 }
        )
      }
    }
    
    if (updates.website && typeof updates.website === 'string') {
      try {
        const url = new URL(updates.website)
        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('Invalid protocol')
        }
      } catch {
        return NextResponse.json(
          { error: 'Invalid website format' },
          { status: 400 }
        )
      }
    }
    
    // Validate color if provided (should be hex)
    if (updates.primary_color && typeof updates.primary_color === 'string') {
      const colorRegex = /^#[0-9A-Fa-f]{6}$/
      if (!colorRegex.test(updates.primary_color)) {
        return NextResponse.json(
          { error: 'Invalid primary_color format (use #RRGGBB)' },
          { status: 400 }
        )
      }
    }
    
    // Add timestamp
    updates.updated_at = new Date().toISOString()
    
    // Update settings
    const { data: settings, error } = await supabase
      .from('company_settings')
      .update(updates)
      .eq('admin_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Error updating settings:', error)
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }

    return NextResponse.json(settings)
  } catch (error) {
    logger.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
