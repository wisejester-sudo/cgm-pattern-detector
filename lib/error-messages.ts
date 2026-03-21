// Standardized, user-friendly error messages
// Every error in the app should use these messages or follow this format

export const ErrorMessages = {
  // Authentication errors
  AUTH: {
    UNAUTHORIZED: "Please sign in to continue.",
    SESSION_EXPIRED: "Your session has expired. Please sign in again.",
    INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
  },
  
  // Database errors
  DATABASE: {
    CONNECTION_ERROR: "Unable to connect to the server. Please check your internet connection and try again.",
    NOT_FOUND: "The requested information could not be found. It may have been deleted or moved.",
    PERMISSION_DENIED: "You don't have permission to perform this action. Please contact your administrator.",
    TIMEOUT: "The request took too long. Please try again.",
  },
  
  // Job-related errors
  JOBS: {
    CREATE_FAILED: "Unable to create the job. Please check all required fields and try again.",
    UPDATE_FAILED: "Unable to update the job. Please check your changes and try again.",
    DELETE_FAILED: "Unable to delete the job. Please try again later.",
    NOT_FOUND: "This job could not be found. It may have been deleted.",
    INVALID_DATE: "Please select a valid date and time for this job.",
    MISSING_CUSTOMER_INFO: "Please provide the customer's name, phone number, and address.",
  },
  
  // Technician errors
  TECHNICIANS: {
    CREATE_FAILED: "Unable to add the technician. Please check all required fields.",
    UPDATE_FAILED: "Unable to update the technician information.",
    DELETE_FAILED: "Unable to remove the technician. Please try again.",
    INVALID_PHONE: "Please enter a valid phone number (10-15 digits).",
    INVALID_PIN: "Please enter a valid 4-digit PIN.",
  },
  
  // SMS errors
  SMS: {
    SEND_FAILED: "Unable to send the SMS. Please check the phone number and try again.",
    INVALID_PHONE: "The phone number appears to be invalid. Please check and try again.",
    RATE_LIMIT: "Too many messages sent. Please wait a moment and try again.",
  },
  
  // File upload errors
  UPLOAD: {
    TOO_LARGE: "The file is too large. Maximum size is 10MB.",
    INVALID_TYPE: "Invalid file type. Please upload an image (JPG, PNG, or GIF).",
    UPLOAD_FAILED: "Unable to upload the file. Please try again.",
  },
  
  // General errors
  GENERAL: {
    UNKNOWN_ERROR: "Something went wrong. Please try again or contact support if the problem persists.",
    NETWORK_ERROR: "Network connection issue. Please check your internet and try again.",
    VALIDATION_ERROR: "Please check the form for errors and try again.",
    REQUIRED_FIELD: "This field is required.",
  }
}

// Helper to get user-friendly error message from API error
export function getErrorMessage(error: any, context: keyof typeof ErrorMessages = 'GENERAL'): string {
  // If it's a known error type, use specific message
  if (error?.code) {
    switch (error.code) {
      case 'PGRST301':
        return ErrorMessages.DATABASE.PERMISSION_DENIED
      case 'PGRST204':
        return ErrorMessages.DATABASE.NOT_FOUND
      case '23505':
        return "This information already exists. Please use different values."
      case '23502':
        return "Please fill in all required fields."
      case '23503':
        return "The referenced item does not exist. Please check your selection."
      case '42P01':
        return ErrorMessages.DATABASE.NOT_FOUND
      case '42501':
        return ErrorMessages.DATABASE.PERMISSION_DENIED
      case 'PGRST205':
        return ErrorMessages.DATABASE.NOT_FOUND
    }
  }
  
  // If it has a specific error message from our API
  if (error?.error && typeof error.error === 'string') {
    return error.error
  }
  
  // If it has validation errors
  if (error?.details && typeof error.details === 'object') {
    const fields = Object.keys(error.details)
    if (fields.length > 0) {
      return `Please fix the following: ${fields.join(', ')}`
    }
  }
  
  // Network errors
  if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
    return ErrorMessages.DATABASE.CONNECTION_ERROR
  }
  
  // Timeout errors
  if (error?.message?.includes('timeout')) {
    return ErrorMessages.DATABASE.TIMEOUT
  }
  
  // Return context-specific message or general error
  const contextMessages = ErrorMessages[context] as Record<string, string> | undefined
  return contextMessages?.UNKNOWN_ERROR || ErrorMessages.GENERAL.UNKNOWN_ERROR
}

// Helper to get actionable next steps
export function getActionableStep(error: any): string | null {
  if (error?.code === 'PGRST301' || error?.code === '42501') {
    return "Please sign out and sign back in, or contact your administrator."
  }
  
  if (error?.code?.startsWith('235')) {
    return "Please review the form and ensure all fields are filled correctly."
  }
  
  if (error?.message?.includes('network')) {
    return "Check your internet connection and refresh the page."
  }
  
  return null
}
