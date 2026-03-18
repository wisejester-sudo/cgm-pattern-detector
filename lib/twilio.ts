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

interface SMSResult {
  success: boolean
  messageId?: string
  error?: string
}

interface SendSMSOptions {
  to: string
  body: string
  from?: string
  mediaUrls?: string[]
}

/**
 * Send SMS via Twilio
 * @param options - SendSMSOptions object or separate arguments
 * @returns Promise<SMSResult> - Result with success status and messageId
 */
export async function sendSMS(options: SendSMSOptions): Promise<SMSResult>
export async function sendSMS(to: string, body: string, from?: string): Promise<SMSResult>
export async function sendSMS(
  arg1: string | SendSMSOptions,
  arg2?: string,
  arg3?: string
): Promise<SMSResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !fromNumber) {
    console.error("[Twilio] Missing configuration")
    return { success: false, error: "Missing Twilio configuration" }
  }

  // Handle both object and separate argument formats
  let to: string
  let body: string
  let from: string | undefined
  let mediaUrls: string[] | undefined

  if (typeof arg1 === 'object') {
    // Object format: { to, body, from?, mediaUrls? }
    to = arg1.to
    body = arg1.body
    from = arg1.from
    mediaUrls = arg1.mediaUrls
  } else {
    // Separate arguments: (to, body, from?)
    to = arg1
    body = arg2 || ''
    from = arg3
  }

  const senderNumber = from || fromNumber

  try {
    const params = new URLSearchParams({
      To: formatPhoneNumber(to),
      From: senderNumber,
      Body: body,
    })

    // Add media URLs if provided (for MMS)
    if (mediaUrls && mediaUrls.length > 0) {
      mediaUrls.forEach((url, index) => {
        params.append(`MediaUrl`, url)
      })
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[Twilio] Error sending SMS:", errorText)
      return { success: false, error: errorText }
    }

    // Parse the response to get the message SID
    const responseData = await response.json()
    return { 
      success: true, 
      messageId: responseData.sid 
    }
  } catch (error) {
    console.error("[Twilio] Exception sending SMS:", error)
    return { success: false, error: String(error) }
  }
}

/**
 * Generate a magic link for photo access
 * @param photoId - The photo ID
 * @param jobId - The job ID
 * @param expiresInHours - How long the link is valid (default: 24 hours)
 * @returns string - The magic link URL
 */
export function generatePhotoLink(
  photoId: string,
  jobId: string,
  expiresInHours: number = 24
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://getdispatchly.co"
  
  // Generate a simple token (in production, use a proper JWT or signed URL)
  const timestamp = Date.now()
  const expiry = timestamp + (expiresInHours * 60 * 60 * 1000)
  const data = `${photoId}:${jobId}:${expiry}`
  
  // Create a simple hash (in production, use a proper HMAC with secret)
  const hash = crypto
    .createHash("sha256")
    .update(data + (process.env.PHOTO_LINK_SECRET || "default-secret"))
    .digest("hex")
    .slice(0, 16)
  
  // Build the URL
  const params = new URLSearchParams({
    photo: photoId,
    job: jobId,
    expires: expiry.toString(),
    token: hash,
  })
  
  return `${baseUrl}/photos/view?${params.toString()}`
}

/**
 * Generate a magic link for technician job access
 * @param jobId - The job ID
 * @param technicianId - The technician ID
 * @param expiresInHours - How long the link is valid (default: 72 hours)
 * @returns string - The magic link URL
 */
export function generateTechnicianJobLink(
  jobId: string,
  technicianId: string,
  expiresInHours: number = 72
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://getdispatchly.co"
  
  const timestamp = Date.now()
  const expiry = timestamp + (expiresInHours * 60 * 60 * 1000)
  const data = `${jobId}:${technicianId}:${expiry}`
  
  const hash = crypto
    .createHash("sha256")
    .update(data + (process.env.MAGIC_LINK_SECRET || "default-secret"))
    .digest("hex")
    .slice(0, 16)
  
  const params = new URLSearchParams({
    job: jobId,
    tech: technicianId,
    expires: expiry.toString(),
    token: hash,
  })
  
  return `${baseUrl}/t/${jobId}?${params.toString()}`
}
