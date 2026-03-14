import twilio from "twilio"

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromNumber = process.env.TWILIO_PHONE_NUMBER

// Check if credentials look valid (real Twilio SIDs start with "AC")
const hasValidCredentials = accountSid?.startsWith("AC") && authToken && authToken.length > 10

// Initialize Twilio client only if credentials are valid
const client = hasValidCredentials ? twilio(accountSid, authToken) : null

export interface SendSMSOptions {
  to: string
  body: string
  mediaUrls?: string[]
}

export interface SMSResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send an SMS message via Twilio
 */
export async function sendSMS({ to, body, mediaUrls }: SendSMSOptions): Promise<SMSResult> {
  if (!client || !fromNumber) {
    console.error("[Twilio] Missing Twilio credentials")
    return { success: false, error: "Twilio not configured" }
  }

  try {
    // Normalize phone number (remove non-digits, add +1 if needed)
    const normalizedTo = normalizePhoneNumber(to)
    
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
    
    return {
      success: true,
      messageId: message.sid,
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
  if (!authToken || authToken.length < 10) return false
  
  const twilioLib = require("twilio")
  return twilioLib.validateRequest(authToken, signature, url, params)
}
