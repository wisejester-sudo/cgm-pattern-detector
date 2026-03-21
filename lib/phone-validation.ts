/**
 * Phone number validation and formatting utilities
 */

// Common country codes
export const countryCodes = [
  { code: "+1", country: "US/Canada", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+31", country: "Netherlands", flag: "🇳🇱" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
  { code: "+52", country: "Mexico", flag: "🇲🇽" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
  { code: "+64", country: "New Zealand", flag: "🇳🇿" },
]

/**
 * Remove all non-digit characters from phone number
 */
export function stripNonDigits(phone: string): string {
  return phone.replace(/\D/g, "")
}

/**
 * Format phone number for display (US format: (555) 123-4567)
 */
export function formatPhoneForDisplay(phone: string, countryCode: string = "+1"): string {
  const digits = stripNonDigits(phone)
  
  if (countryCode === "+1") {
    // US/Canada format
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    } else if (digits.length === 11 && digits.startsWith("1")) {
      return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
    }
  }
  
  // Return cleaned digits if no formatting applied
  return digits
}

/**
 * Normalize phone to E.164 format (+15551234567)
 */
export function normalizePhone(
  phone: string,
  countryCode: string = "+1"
): { isValid: boolean; formatted: string; error?: string } {
  const digits = stripNonDigits(phone)
  
  // Remove leading 1 if present (for US/Canada)
  let cleanedDigits = digits
  if (countryCode === "+1" && digits.length === 11 && digits.startsWith("1")) {
    cleanedDigits = digits.slice(1)
  }
  
  // Validate length
  if (cleanedDigits.length === 0) {
    return { isValid: false, formatted: "", error: "Phone number is required" }
  }
  
  if (cleanedDigits.length < 10) {
    return { isValid: false, formatted: "", error: "Phone number is too short" }
  }
  
  if (cleanedDigits.length > 15) {
    return { isValid: false, formatted: "", error: "Phone number is too long" }
  }
  
  // Format for US/Canada
  if (countryCode === "+1") {
    if (cleanedDigits.length !== 10) {
      return { isValid: false, formatted: "", error: "US/Canada numbers need 10 digits" }
    }
    
    // Check for valid area code (not starting with 0 or 1)
    const areaCode = cleanedDigits.slice(0, 3)
    if (areaCode.startsWith("0") || areaCode.startsWith("1")) {
      return { isValid: false, formatted: "", error: "Invalid area code" }
    }
    
    // Check for valid exchange code (not starting with 0 or 1)
    const exchangeCode = cleanedDigits.slice(3, 6)
    if (exchangeCode.startsWith("0") || exchangeCode.startsWith("1")) {
      return { isValid: false, formatted: "", error: "Invalid exchange code" }
    }
  }
  
  return {
    isValid: true,
    formatted: `${countryCode}${cleanedDigits}`,
  }
}

/**
 * Validate phone number with detailed error message
 */
export function validatePhone(
  phone: string,
  countryCode: string = "+1"
): { isValid: boolean; error?: string } {
  const result = normalizePhone(phone, countryCode)
  
  if (!result.isValid) {
    return { isValid: false, error: result.error }
  }
  
  return { isValid: true }
}

/**
 * Mask phone number for display (e.g., (555) ***-**67)
 */
export function maskPhoneNumber(phone: string): string {
  const digits = stripNonDigits(phone)
  
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ***-**${digits.slice(8)}`
  } else if (digits.length === 11) {
    return `(${digits.slice(1, 4)}) ***-**${digits.slice(9)}`
  }
  
  return phone
}

/**
 * Parse international phone number
 */
export function parseInternationalPhone(phone: string): {
  countryCode: string
  nationalNumber: string
} {
  const digits = stripNonDigits(phone)
  
  // Check for + prefix
  if (phone.startsWith("+")) {
    // Try to detect country code
    for (const cc of countryCodes) {
      const codeDigits = stripNonDigits(cc.code)
      if (digits.startsWith(codeDigits)) {
        return {
          countryCode: cc.code,
          nationalNumber: digits.slice(codeDigits.length),
        }
      }
    }
  }
  
  // Default to +1
  return {
    countryCode: "+1",
    nationalNumber: digits,
  }
}
