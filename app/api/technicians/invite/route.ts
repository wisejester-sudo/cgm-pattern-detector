import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/twilio'
import crypto from 'crypto'

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
    const { technicianId, name, phone, email } = body

    if (!technicianId && !name) {
      return NextResponse.json(
        { error: 'Missing technician ID or name' },
        { status: 400 }
      )
    }

    // Generate magic link token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    let technician: any

    if (technicianId) {
      // Update existing technician with magic link token
      const { error: updateError } = await supabase
        .from('technicians')
        .update({
          magic_link_token: token,
          token_expires_at: expiresAt.toISOString(),
          invited_at: new Date().toISOString(),
          invited_by: user.id,
        })
        .eq('id', technicianId)
        .eq('admin_id', user.id)

      if (updateError) {
        console.error('[API] Error updating technician:', updateError)
        return NextResponse.json(
          { error: 'Failed to generate invite link' },
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
      // Create new technician with magic link token
      const { data: newTech, error: createError } = await supabase
        .from('technicians')
        .insert({
          admin_id: user.id,
          name,
          email: email || null,
          phone,
          magic_link_token: token,
          token_expires_at: expiresAt.toISOString(),
          invited_at: new Date().toISOString(),
          invited_by: user.id,
          is_active: true,
        })
        .select()
        .single()

      if (createError) {
        console.error('[API] Error creating technician:', createError)
        return NextResponse.json(
          { error: 'Failed to create technician invitation' },
          { status: 500 }
        )
      }

      technician = newTech
    }

    // Generate magic link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const magicLink = `${baseUrl}/t/${token}`

    // Send via available channels (SMS and/or Email)
    const results = {
      sms: { sent: false, error: null as string | null },
      email: { sent: false, error: null as string | null },
    }
    
    // Send SMS if phone number exists
    if (technician.phone) {
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
    
    // Send Email if email exists (placeholder for future email integration)
    if (technician.email) {
      // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
      // For now, mark as not sent but indicate it would be sent
      results.email.sent = false
      results.email.error = 'Email service not configured. Magic link sent via SMS only.'
      
      // When email service is added:
      // const emailResult = await sendEmail({
      //   to: technician.email,
      //   subject: 'Your Dispatchly Invitation',
      //   body: `Click here to access your jobs: ${magicLink}`,
      // })
      // results.email.sent = emailResult.success
    }

    return NextResponse.json({
      success: true,
      magicLink,
      technician,
      expiresAt: expiresAt.toISOString(),
      smsSent: results.sms.sent,
      smsError: results.sms.error,
      emailSent: results.email.sent,
      emailError: results.email.error,
      sentVia: technician.phone && results.sms.sent ? 'sms' : 
               technician.email ? 'email_pending' : 'none',
    })
  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
