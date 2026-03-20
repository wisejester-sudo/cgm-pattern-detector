// XSS Sanitization Utilities
import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes all HTML tags and returns plain text
 */
export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return ''
  return DOMPurify.sanitize(dirty, { 
    ALLOWED_TAGS: [], // No HTML allowed
    ALLOWED_ATTR: [], // No attributes allowed
  })
}

/**
 * Sanitize HTML but allow specific safe tags (for rich text)
 */
export function sanitizeHtmlAllowTags(
  dirty: string | null | undefined,
  allowedTags: string[] = ['b', 'i', 'em', 'strong', 'p', 'br']
): string {
  if (!dirty) return ''
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: [], // Still no attributes for security
  })
}

/**
 * Escape HTML special characters
 * Use this when inserting into HTML attributes or text content
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Sanitize user input for database storage
 * Removes potentially dangerous characters but preserves text
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input) return ''
  // Remove null bytes and control characters
  return input
    .replace(/\x00/g, '') // Remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars
    .trim()
}

/**
 * Validate and sanitize phone number
 */
export function sanitizePhone(phone: string | null | undefined): string {
  if (!phone) return ''
  // Remove all non-numeric characters except + for international
  return phone.replace(/[^0-9+]/g, '')
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string | null | undefined): string {
  if (!email) return ''
  return email.toLowerCase().trim()
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return ''
  // Only allow http/https URLs
  const cleanUrl = url.trim()
  if (!cleanUrl.match(/^https?:\/\//i)) {
    return ''
  }
  return cleanUrl
}

/**
 * Sanitize SMS template content
 * Escapes curly braces to prevent template injection
 */
export function sanitizeTemplate(template: string | null | undefined): string {
  if (!template) return ''
  // Remove potentially dangerous template syntax
  return template
    .replace(/\{\{/g, '{ {') // Break up {{ 
    .replace(/\}\}/g, '} }') // Break up }}
    .replace(/<%/g, '&lt;%') // Break up <%
    .replace(/%>/g, '%&gt;') // Break up %>
}

/**
 * Sanitize all string fields in an object
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  fieldsToSanitize: (keyof T)[]
): T {
  const sanitized = { ...obj }
  
  fieldsToSanitize.forEach((field) => {
    const value = sanitized[field]
    if (typeof value === 'string') {
      (sanitized as Record<string, unknown>)[field as string] = sanitizeInput(value)
    }
  })
  
  return sanitized
}
