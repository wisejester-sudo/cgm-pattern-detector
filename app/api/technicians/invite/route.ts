import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/twilio'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  console.log('[API] Invite endpoint called')
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('[API] Missing Supabase env vars')
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    console.log('[API] Creating Supabase client...')
    const supabase = await createClient()
    if (!supabase) {
      console.error('[API] Failed to create Supabase client')
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }
    
    console.log('[API] Getting user...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { technicianId, name, phone, email, method = 'auto' } = body

    if (!technicianId && !name) {
      return NextResponse.json(
        { error: 'Missing technician ID or name' },
        { status: 400 }
      )
    }

    // Generate magic link token with environment context
    const token = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    
    // Capture environment context for multi-environment safety
    const environment = process.env.VERCEL_ENV || 'development'
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    console.log('[API] Generating magic link for environment:', environment, 'baseUrl:', baseUrl)

    let technician: any

    if (technicianId) {
      console.log('[API] Updating existing technician:', technicianId)
      
      // Update existing technician with magic link token hash and environment
      const { error: updateError } = await supabase
        .from('technicians')
        .update({
          magic_link_token: tokenHash,
          magic_link_expires_at: expiresAt.toISOString(),
          environment: environment,
          base_url: baseUrl,
          invited_at: new Date().toISOString(),
          invited_by: user.id,
        })
        .eq('id', technicianId)
        .eq('admin_id', user.id)

      if (updateError) {
        console.error('[API] Error updating technician:', updateError)
        return NextResponse.json(
          { error: `Failed to update technician: ${updateError.message}` },
          { status: 500 }
        )
      }

      // Fetch updated technician
      const { data: tech, error: fetchError } = await supabase
        .from('technicians')
        .select('*')
        .eq('id', technicianId)
        .single()

      if (fetchError || !tech) {
        return NextResponse.json(
          { error: 'Technician not found' },
          { status: 404 }
        )
      }

      technician = tech
    } else {
      console.log('[API] Creating new technician:', { name, email, phone })
      
      // Create new technician with magic link token hash and environment
      const { data: newTech, error: createError } = await supabase
        .from('technicians')
        .insert({
          admin_id: user.id,
          name,
          email: email || null,
          phone,
          magic_link_token: tokenHash,
          magic_link_expires_at: expiresAt.toISOString(),
          environment: environment,
          base_url: baseUrl,
          invited_at: new Date().toISOString(),
          invited_by: user.id,
          is_active: true,
        })
        .select()
        .single()

      if (createError) {
        console.error('[API] Error creating technician:', createError)
        return NextResponse.json(
          { error: `Failed to create technician: ${createError.message}` },
          { status: 500 }
        )
      }

      technician = newTech
      console.log('[API] Technician created:', technician.id)
    }

    // Generate magic link (baseUrl already defined above)
    const magicLink = `${baseUrl}/t/${token}`

    // Send via selected method
    console.log('[API] Preparing to send via method:', method)
    console.log('[API] Technician phone:', technician.phone)
    console.log('[API] Twilio env vars:', {
      hasAccountSid: !!process.env.TWILIO_ACCOUNT_SID,
      hasAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
      hasPhoneNumber: !!process.env.TWILIO_PHONE_NUMBER,
    })
    
    const results = {
      sms: { sent: false, error: null as string | null },
      email: { sent: false, error: null as string | null },
    }
    
    // Send SMS if method is 'sms' or 'auto' and phone exists
    if ((method === 'sms' || method === 'auto') && technician.phone) {
      console.log('[API] Sending SMS invite to:', technician.phone)
      const message = `You've been invited to join Dispatchly! Click here to access your jobs: ${magicLink} Link expires in 7 days.`
      
      const result = await sendSMS({
        to: technician.phone,
        body: message,
      })
      
      results.sms.sent = result.success
      results.sms.error = result.error || null
      
      if (!result.success) {
        console.error('[API] Failed to send magic link SMS:', result.error)
      }
    }
    
    // Email sending - currently SMS-only mode
    if (method === 'email' && technician.email) {
      results.email.sent = false
      results.email.error = 'Email service not configured. Please use SMS instead.'
    }

    const response = {
      success: true,
      magicLink,
      technician,
      expiresAt: expiresAt.toISOString(),
      smsSent: results.sms.sent,
      smsError: results.sms.error,
      emailSent: results.email.sent,
      emailError: results.email.error,
      sentVia: results.sms.sent ? 'sms' : results.email.sent ? 'email' : 'none',
      requestedMethod: method,
    }
    
    // Invite sent successfully
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error?.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}
