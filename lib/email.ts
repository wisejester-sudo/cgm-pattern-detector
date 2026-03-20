/**
 * Email Service for Dispatchly
 * 
 * Supports multiple providers:
 * - SendGrid (recommended for production)
 * - AWS SES
 * - SMTP (fallback)
 * 
 * Set EMAIL_PROVIDER env var to choose provider.
 * Defaults to SendGrid if SENDGRID_API_KEY is set.
 */

export interface EmailOptions {
  to: string
  subject: string
  text: string
  html?: string
  from?: string
}

export interface EmailResult {
  success: boolean
  error?: string
  messageId?: string
}

/**
 * Send email using configured provider
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const provider = process.env.EMAIL_PROVIDER || 
    (process.env.SENDGRID_API_KEY ? 'sendgrid' : 'none')

  switch (provider) {
    case 'sendgrid':
      return sendWithSendGrid(options)
    case 'ses':
      return sendWithSES(options)
    case 'smtp':
      return sendWithSMTP(options)
    default:
      console.log('[Email] No email provider configured')
      return {
        success: false,
        error: 'Email service not configured. Please contact support to enable email.',
      }
  }
}

/**
 * Send email using SendGrid
 */
async function sendWithSendGrid(options: EmailOptions): Promise<EmailResult> {
  try {
    const apiKey = process.env.SENDGRID_API_KEY
    if (!apiKey) {
      return {
        success: false,
        error: 'SendGrid API key not configured',
      }
    }

    const fromEmail = options.from || process.env.FROM_EMAIL || 'noreply@getdispatchly.co'
    const fromName = process.env.FROM_NAME || 'Dispatchly'

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: options.to }],
          },
        ],
        from: {
          email: fromEmail,
          name: fromName,
        },
        subject: options.subject,
        content: [
          {
            type: 'text/plain',
            value: options.text,
          },
          ...(options.html
            ? [
                {
                  type: 'text/html',
                  value: options.html,
                },
              ]
            : []),
        ],
      }),
    })

    if (response.ok) {
      return {
        success: true,
        messageId: response.headers.get('X-Message-Id') || undefined,
      }
    } else {
      const error = await response.text()
      console.error('[Email] SendGrid error:', error)
      return {
        success: false,
        error: `Failed to send email: ${error}`,
      }
    }
  } catch (error) {
    console.error('[Email] SendGrid exception:', error)
    return {
      success: false,
      error: 'Email service temporarily unavailable',
    }
  }
}

/**
 * Send email using AWS SES
 */
async function sendWithSES(options: EmailOptions): Promise<EmailResult> {
  // TODO: Implement AWS SES integration
  console.log('[Email] AWS SES not yet implemented')
  return {
    success: false,
    error: 'AWS SES integration not configured',
  }
}

/**
 * Send email using SMTP
 */
async function sendWithSMTP(options: EmailOptions): Promise<EmailResult> {
  // TODO: Implement SMTP integration
  console.log('[Email] SMTP not yet implemented')
  return {
    success: false,
    error: 'SMTP integration not configured',
  }
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!(
    process.env.SENDGRID_API_KEY ||
    process.env.EMAIL_PROVIDER === 'ses' ||
    process.env.EMAIL_PROVIDER === 'smtp'
  )
}
