import twilio from "twilio"

export interface SendSMSOptions {
  to: string
  body: string
  mediaUrls?: string[]
}

export interface SMSResult {
  success: boolean
  messageId?: string
  error?: string
  status?: string
}

/**
 * Send an SMS message via Twilio
 */
export async function sendSMS({ to, body, mediaUrls }: SendSMSOptions): Promise<SMSResult> {
  // Get credentials inside function to ensure they're loaded
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  console.log("[Twilio] Environment check:", {
    hasAccountSid: !!accountSid,
    hasAuthToken: !!authToken,
    hasFromNumber: !!fromNumber,
    accountSidPrefix: accountSid?.substring(0, 4),
    fromNumber,
  })

  // Check if credentials look valid (real Twilio SIDs start with "AC")
  const hasValidCredentials = accountSid?.startsWith("AC") && authToken && authToken.length > 10

  if (!hasValidCredentials || !fromNumber) {
    console.error("[Twilio] Missing or invalid Twilio credentials:", {
      hasValidCredentials,
      fromNumber,
      accountSidPrefix: accountSid?.substring(0, 4),
    })
    return { success: false, error: "Twilio not configured - check env vars" }
  }

  // Initialize Twilio client
  const client = twilio(accountSid, authToken)

  try {
    // Normalize phone number (remove non-digits, add +1 if needed)
    const normalizedTo = normalizePhoneNumber(to)
    
    console.log("[Twilio] Sending SMS:", {
      to: normalizedTo,
      from: fromNumber,
      bodyLength: body.length,
    })
    
    const messageOptions: {
      to: string
      from: string
      body: string
      mediaUrl?: string[]
    } = {
      to: normalizedTo,
      from: fromNumber,
      body,
    }

    // Add media URLs if provided (for MMS with photos)
    if (mediaUrls && mediaUrls.length > 0) {
      messageOptions.mediaUrl = mediaUrls
    }

    const message = await client.messages.create(messageOptions)
    
    console.log("[Twilio] SMS API response:", {
      messageId: message.sid,
      status: message.status,
      to: message.to,
      from: message.from,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
      price: message.price,
    })
    
    // Check if message was actually accepted
    const isAccepted = ['queued', 'sent', 'delivered', 'accepted'].includes(message.status)
    
    if (!isAccepted) {
      return {
        success: false,
        error: `Twilio status: ${message.status}. Error: ${message.errorMessage || 'Unknown'}`,
      }
    }
    
    return {
      success: true,
      messageId: message.sid,
      status: message.status,
    }
  } catch (error) {
    console.error("[Twilio] Error sending SMS:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Normalize phone number to E.164 format
 */
function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "")
  
  // If 10 digits, assume US number and add +1
  if (digits.length === 10) {
    return `+1${digits}`
  }
  
  // If 11 digits starting with 1, add +
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`
  }
  
  // Otherwise return as-is with + prefix
  return digits.startsWith("+") ? phone : `+${digits}`
}

/**
 * Generate a public photo viewer link
 */
export function generatePhotoLink(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  return `${baseUrl}/j/${token}`
}

/**
 * Validate Twilio webhook signature
 */
export function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!authToken || authToken.length < 10) return false
  
  const twilioLib = require("twilio")
  return twilioLib.validateRequest(authToken, signature, url, params)
}
