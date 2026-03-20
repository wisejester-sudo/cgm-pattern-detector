// Input Validation Utilities

export interface ValidationRule {
  maxLength?: number
  minLength?: number
  required?: boolean
  pattern?: RegExp
  message?: string
}

export interface ValidationSchema {
  [field: string]: ValidationRule
}

export interface ValidationError {
  field: string
  message: string
}

// Common validation rules
export const commonValidations = {
  name: {
    maxLength: 255,
    minLength: 1,
    required: true,
    message: 'Name must be between 1 and 255 characters'
  },
  email: {
    maxLength: 255,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Invalid email format'
  },
  phone: {
    maxLength: 20,
    pattern: /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/,
    message: 'Invalid phone number format'
  },
  pin: {
    maxLength: 10,
    minLength: 4,
    pattern: /^\d+$/,
    message: 'PIN must be 4-10 digits'
  },
  notes: {
    maxLength: 5000,
    message: 'Notes must not exceed 5000 characters'
  },
  address: {
    maxLength: 500,
    message: 'Address must not exceed 500 characters'
  },
  companyName: {
    maxLength: 255,
    required: true,
    message: 'Company name must be between 1 and 255 characters'
  },
  jobType: {
    maxLength: 100,
    required: true,
    message: 'Job type must be between 1 and 100 characters'
  },
  templateBody: {
    maxLength: 1000,
    required: true,
    message: 'Template body must be between 1 and 1000 characters'
  },
  smsMessage: {
    maxLength: 1600, // Twilio limit
    message: 'SMS message must not exceed 1600 characters'
  }
}

/**
 * Validate a single field
 */
export function validateField(
  value: unknown,
  fieldName: string,
  rules: ValidationRule
): ValidationError | null {
  // Check required
  if (rules.required && (value === undefined || value === null || value === '')) {
    return {
      field: fieldName,
      message: rules.message || `${fieldName} is required`
    }
  }

  // Skip other validations if value is empty and not required
  if (!value && !rules.required) {
    return null
  }

  // Convert to string for length checks
  const strValue = String(value)

  // Check minLength
  if (rules.minLength !== undefined && strValue.length < rules.minLength) {
    return {
      field: fieldName,
      message: rules.message || `${fieldName} must be at least ${rules.minLength} characters`
    }
  }

  // Check maxLength
  if (rules.maxLength !== undefined && strValue.length > rules.maxLength) {
    return {
      field: fieldName,
      message: rules.message || `${fieldName} must not exceed ${rules.maxLength} characters`
    }
  }

  // Check pattern
  if (rules.pattern && !rules.pattern.test(strValue)) {
    return {
      field: fieldName,
      message: rules.message || `${fieldName} format is invalid`
    }
  }

  return null
}

/**
 * Validate an object against a schema
 */
export function validateObject(
  data: Record<string, unknown>,
  schema: ValidationSchema
): ValidationError[] {
  const errors: ValidationError[] = []

  for (const [field, rules] of Object.entries(schema)) {
    const error = validateField(data[field], field, rules)
    if (error) {
      errors.push(error)
    }
  }

  return errors
}

/**
 * Validation schemas for common operations
 */
export const validationSchemas = {
  createJob: {
    customer_name: commonValidations.name,
    customer_phone: commonValidations.phone,
    customer_address: commonValidations.address,
    job_type: commonValidations.jobType,
    notes: commonValidations.notes
  },
  
  createTechnician: {
    name: commonValidations.name,
    email: commonValidations.email,
    phone: commonValidations.phone,
    pin: commonValidations.pin
  },
  
  updateProfile: {
    full_name: commonValidations.name,
    email: commonValidations.email,
    phone: commonValidations.phone
  },
  
  createSMSTemplate: {
    name: {
      maxLength: 100,
      required: true,
      message: 'Template name must be between 1 and 100 characters'
    },
    template_body: commonValidations.templateBody
  },
  
  sendSMS: {
    message: commonValidations.smsMessage,
    to: commonValidations.phone
  },
  
  companySettings: {
    company_name: commonValidations.companyName,
    company_phone: commonValidations.phone,
    tagline: {
      maxLength: 200,
      message: 'Tagline must not exceed 200 characters'
    },
    business_hours: {
      maxLength: 200,
      message: 'Business hours must not exceed 200 characters'
    },
    service_area: {
      maxLength: 500,
      message: 'Service area must not exceed 500 characters'
    }
  }
}

/**
 * Sanitize string input (remove null bytes and control characters)
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input) return ''
  return input
    .replace(/\x00/g, '') // Remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .trim()
}

/**
 * Validate and sanitize input
 */
export function validateAndSanitize(
  data: Record<string, unknown>,
  schema: ValidationSchema
): { errors: ValidationError[]; sanitized: Record<string, unknown> } {
  const errors = validateObject(data, schema)
  
  // Sanitize string fields
  const sanitized: Record<string, unknown> = { ...data }
  for (const key of Object.keys(data)) {
    const value = data[key]
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    }
  }
  
  return { errors, sanitized }
}
