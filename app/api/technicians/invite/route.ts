/**
 * Technician Invite API - Send magic links via SMS and/or Email
 * 
 * Supports:
 * - method: 'sms' | 'email' | 'both' | 'auto'
 * - Same message template for both channels
 * - Detailed results for each channel
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/twilio'
import { sendEmail, isEmailConfigured } from '@/lib/email'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

/**
 * Generate the magic link message (same for SMS and Email)
 */
function generateMagicLinkMessage(technicianName: string, magicLink: string, companyName?: string): string {
  const company = companyName ? ` from ${companyName}` : ''
  return `Hi ${technicianName}, you've been invited${company} to access your jobs on Dispatchly. Click here to get started: ${magicLink}\n\nThis link expires in 7 days. If you have any issues, contact your dispatcher.`
}

/**
 * Generate HTML email version of the message
 */
function generateEmailHTML(technicianName: string, magicLink: string, companyName?: string): string {
  const company = companyName ? ` from <strong>${companyName}</strong>` : ''
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dispatchly Invitation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="color: #2563eb; margin: 0;">Welcome to Dispatchly</h2>
  </div>
  
  <p>Hi ${technicianName},</p>
  
  <p>You've been invited${company} to access your jobs on Dispatchly.</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${magicLink}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
      Access Your Jobs
    </a>
  </div>
  
  <p style="color: #666; font-size: 14px;">
    Or copy this link: <a href="${magicLink}" style="color: #2563eb;">${magicLink}</a>
  </p>
  
  <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
    <strong>⏰ This link expires in 7 days</strong>
  </div>
  
  <p style="color: #666; font-size: 14px; margin-top: 30px;">
    If you have any issues, please contact your dispatcher.
  </p>
  
  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
  
  <p style="color: #999; font-size: 12px;">
    This is an automated message from Dispatchly. Please do not reply to this email.
  </p>
</body>
</html>
  `.trim()
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  console.log(`[${requestId}] Invite endpoint called`)
  
  try {
    // Check Supabase configuration
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error(`[${requestId}] Missing Supabase env vars`)
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    console.log(`[${requestId}] Creating Supabase client...`)
    const supabase = await createClient()
    if (!supabase) {
      console.error(`[${requestId}] Failed to create Supabase client`)
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }
    
    // Check authentication
    console.log(`[${requestId}] Authenticating...`)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get admin's company name
    const { data: adminProfile } = await supabase
      .from('users')
      .select('company_name')
      .eq('id', user.id)
      .single()

    const companyName = adminProfile?.company_name || undefined

    // Parse request body
    const body = await request.json()
    const { 
      technicianId, 
      name, 
      phone, 
      email, 
      method = 'auto' // 'sms' | 'email' | 'both' | 'auto'
    } = body

    if (!technicianId && !name) {
      return NextResponse.json(
        { error: 'Missing technician ID or name' },
        { status: 400 }
      )
    }

    // Validate method
    const validMethods = ['sms', 'email', 'both', 'auto']
    if (!validMethods.includes(method)) {
      return NextResponse.json(
        { error: `Invalid method. Use: ${validMethods.join(', ')}` },
        { status: 400 }
      )
    }

    // Generate magic link token
    const token = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    
    const environment = process.env.VERCEL_ENV || 'development'
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    console.log(`[${requestId}] Generating magic link for environment:`, environment)

    let technician: any

    if (technicianId) {
      console.log(`[${requestId}] Updating existing technician:`, technicianId)
      
      // Get existing technician data
      const { data: existingTech, error: fetchError } = await supabase
        .from('technicians')
        .select('*')
        .eq('id', technicianId)
        .eq('admin_id', user.id)
        .single()

      if (fetchError || !existingTech) {
        return NextResponse.json(
          { error: 'Technician not found' },
          { status: 404 }
        )
      }

      // Update with new token
      const { error: updateError } = await supabase
        .from('technicians')
        .update({
          magic_link_token: tokenHash,
          magic_link_expires_at: expiresAt.toISOString(),
          environment: environment,
          base_url: baseUrl,
          invited_at: new Date().toISOString(),
          invited_by: user.id,
          // Update contact info if provided
          ...(phone && { phone }),
          ...(email && { email }),
        })
        .eq('id', technicianId)
        .eq('admin_id', user.id)

      if (updateError) {
        console.error(`[${requestId}] Error updating technician:`, updateError)
        return NextResponse.json(
          { error: `Failed to update technician: ${updateError.message}` },
          { status: 500 }
        )
      }

      technician = { ...existingTech, ...(phone && { phone }), ...(email && { email }) }
    } else {
      console.log(`[${requestId}] Creating new technician:`, { name, email, phone })
      
      // Check technician limit
      const { count, error: countError } = await supabase
        .from('technicians')
        .select('*', { count: 'exact', head: true })
        .eq('admin_id', user.id)

      if (countError) {
        return NextResponse.json(
          { error: 'Failed to check technician limit' },
          { status: 500 }
        )
      }

      if (count && count >= 10) {
        return NextResponse.json(
          { error: 'Technician limit reached (max 10). Contact sales for enterprise options.' },
          { status: 403 }
        )
      }
      
      // Create new technician
      const { data: newTech, error: createError } = await supabase
        .from('technicians')
        .insert({
          admin_id: user.id,
          name,
          email: email || null,
          phone: phone || null,
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
        console.error(`[${requestId}] Error creating technician:`, createError)
        return NextResponse.json(
          { error: `Failed to create technician: ${createError.message}` },
          { status: 500 }
        )
      }

      technician = newTech
      console.log(`[${requestId}] Technician created:`, technician.id)
    }

    // Generate magic link
    const magicLink = `${baseUrl}/t/${token}`

    // Determine which channels to use based on method and available contact info
    const shouldSendSMS = (method === 'sms' || method === 'both' || 
      (method === 'auto' && technician.phone))
    const shouldSendEmail = (method === 'email' || method === 'both' || 
      (method === 'auto' && technician.email && !technician.phone)) // Email fallback if no phone

    // Results tracking
    const results = {
      sms: { sent: false, error: null as string | null },
      email: { sent: false, error: null as string | null },
    }

    // Generate the message (same for both channels)
    const messageText = generateMagicLinkMessage(technician.name, magicLink, companyName)

    // Send SMS
    if (shouldSendSMS && technician.phone) {
      console.log(`[${requestId}] Sending SMS to:`, technician.phone)
      
      const result = await sendSMS({
        to: technician.phone,
        body: messageText,
      })
      
      results.sms.sent = result.success
      results.sms.error = result.error || null
      
      if (!result.success) {
        console.error(`[${requestId}] SMS failed:`, result.error)
      } else {
        console.log(`[${requestId}] SMS sent successfully`)
      }
    } else if (shouldSendSMS && !technician.phone) {
      results.sms.error = 'No phone number available for this technician'
    }

    // Send Email
    if (shouldSendEmail && technician.email) {
      console.log(`[${requestId}] Sending email to:`, technician.email)
      
      const emailConfigured = isEmailConfigured()
      
      if (!emailConfigured) {
        results.email.error = 'Email service not configured. Add SENDGRID_API_KEY to enable email.'
        console.warn(`[${requestId}] Email not configured`)
      } else {
        const result = await sendEmail({
          to: technician.email,
          subject: `You've been invited to Dispatchly${companyName ? ` by ${companyName}` : ''}`,
          text: messageText,
          html: generateEmailHTML(technician.name, magicLink, companyName),
        })
        
        results.email.sent = result.success
        results.email.error = result.error || null
        
        if (!result.success) {
          console.error(`[${requestId}] Email failed:`, result.error)
        } else {
          console.log(`[${requestId}] Email sent successfully`)
        }
      }
    } else if (shouldSendEmail && !technician.email) {
      results.email.error = 'No email address available for this technician'
    }

    // Determine overall success
    const anySuccess = results.sms.sent || results.email.sent
    const bothFailed = !results.sms.sent && !results.email.sent && 
      (results.sms.error || results.email.error)

    if (bothFailed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send invitation via all channels',
          magicLink, // Still return link so admin can copy/paste if needed
          technician,
          results,
        },
        { status: 500 }
      )
    }

    // Success response
    const channelsUsed = []
    if (results.sms.sent) channelsUsed.push('sms')
    if (results.email.sent) channelsUsed.push('email')

    return NextResponse.json({
      success: true,
      message: `Invitation sent successfully via ${channelsUsed.join(' and ')}`,
      magicLink,
      technician,
      expiresAt: expiresAt.toISOString(),
      results: {
        sms: {
          sent: results.sms.sent,
          error: results.sms.error,
        },
        email: {
          sent: results.email.sent,
          error: results.email.error,
        },
      },
      sentVia: channelsUsed,
      requestedMethod: method,
    })
    
  } catch (error: any) {
    console.error(`[${requestId}] Unexpected error:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
