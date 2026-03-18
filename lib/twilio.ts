import crypto from "crypto"

/**
 * Validate Twilio webhook signature
 * @param signature - X-Twilio-Signature header
 * @param url - Request URL
 * @param params - Request body params
 * @returns boolean - Whether signature is valid
 */
export function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  
  if (!authToken) {
    console.warn("[Twilio] No auth token configured, skipping signature validation")
    return true // Allow in development
  }

  try {
    // Sort params alphabetically and create string
    const sortedKeys = Object.keys(params).sort()
    let data = url
    
    for (const key of sortedKeys) {
      data += key
      data += params[key]
    }

    // Calculate expected signature
    const expectedSignature = crypto
      .createHmac("sha1", authToken)
      .update(Buffer.from(data, "utf-8"))
      .digest("base64")

    // Compare signatures (constant time comparison)
    const signatureBuffer = Buffer.from(signature, "base64")
    const expectedBuffer = Buffer.from(expectedSignature, "base64")
    
    if (signatureBuffer.length !== expectedBuffer.length) {
      return false
    }

    let result = 0
    for (let i = 0; i < signatureBuffer.length; i++) {
      result |= signatureBuffer[i] ^ expectedBuffer[i]
    }

    return result === 0
  } catch (error) {
    console.error("[Twilio] Error validating signature:", error)
    return false
  }
}

/**
 * Format phone number to E.164 format
 * @param phone - Phone number in any format
 * @returns string - Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "")
  
  // If starts with 1, return as is
  if (cleaned.startsWith("1") && cleaned.length === 11) {
    return `+${cleaned}`
  }
  
  // Otherwise assume US number and add +1
  if (cleaned.length === 10) {
    return `+1${cleaned}`
  }
  
  // Return original if doesn't match expected patterns
  return phone
}

/**
 * Normalize phone number for lookup
 * @param phone - Phone number in any format
 * @returns string - Normalized phone number (last 10 digits)
 */
export function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")
  // Return last 10 digits for US numbers
  return cleaned.slice(-10)
}

/**
 * Send SMS via Twilio
 * @param to - Recipient phone number
 * @param body - Message body
 * @param from - Sender phone number (optional, uses env var)
 * @returns Promise<boolean> - Whether message was sent successfully
 */
export async function sendSMS(
  to: string,
  body: string,
  from?: string
): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = from || process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !fromNumber) {
    console.error("[Twilio] Missing configuration")
    return false
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: formatPhoneNumber(to),
          From: fromNumber,
          Body: body,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error("[Twilio] Error sending SMS:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("[Twilio] Exception sending SMS:", error)
    return false
  }
}
