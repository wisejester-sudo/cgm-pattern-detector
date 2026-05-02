/**
 * Dispatchly v3.0 - Comprehensive Error Handling
 * 
 * Features:
 * - Custom error classes for different error types
 * - Request ID tracking for debugging
 * - Structured logging integration
 * - Standardized API error responses
 * - Error codes for client-side handling
 */

import { NextResponse } from "next/server"
import { logger } from "./logger"

// ============================================================================
// ERROR CODES
// ============================================================================

export const ErrorCodes = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_PHONE: 'INVALID_PHONE',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_DATE: 'INVALID_DATE',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // Database errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  DATABASE_CONNECTION: 'DATABASE_CONNECTION',
  DATABASE_TIMEOUT: 'DATABASE_TIMEOUT',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  
  // Twilio/SMS errors
  TWILIO_ERROR: 'TWILIO_ERROR',
  SMS_SEND_FAILED: 'SMS_SEND_FAILED',
  INVALID_PHONE_NUMBER: 'INVALID_PHONE_NUMBER',
  
  // Company/Provisioning errors
  PROVISIONING_FAILED: 'PROVISIONING_FAILED',
  NUMBER_UNAVAILABLE: 'NUMBER_UNAVAILABLE',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

// ============================================================================
// HTTP STATUS CODES
// ============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  SERVICE_UNAVAILABLE: 503,
} as const

// ============================================================================
// BASE ERROR CLASS
// ============================================================================

export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly requestId: string
  public readonly details?: Record<string, unknown>
  public readonly cause?: Error

  constructor(
    message: string,
    code: ErrorCode = ErrorCodes.INTERNAL_ERROR,
    statusCode: number = HTTP_STATUS.INTERNAL_ERROR,
    options: {
      requestId?: string
      details?: Record<string, unknown>
      cause?: Error
    } = {}
  ) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.statusCode = statusCode
    this.requestId = options.requestId || crypto.randomUUID()
    this.details = options.details
    this.cause = options.cause

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      requestId: this.requestId,
      ...(this.details && process.env.NODE_ENV !== 'production' ? { details: this.details } : {}),
    }
  }

  log() {
    logger.error(`[${this.requestId}] ${this.code}: ${this.message}`, {
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      cause: this.cause?.message,
      stack: this.stack,
    })
  }
}

// ============================================================================
// SPECIFIC ERROR CLASSES
// ============================================================================

export class ValidationError extends AppError {
  constructor(
    message: string,
    details?: Record<string, string>,
    options?: { requestId?: string }
  ) {
    super(
      message,
      ErrorCodes.VALIDATION_ERROR,
      HTTP_STATUS.BAD_REQUEST,
      { ...options, details }
    )
  }
}

export class AuthenticationError extends AppError {
  constructor(
    message: string = 'Authentication required',
    code: ErrorCode = ErrorCodes.UNAUTHORIZED,
    options?: { requestId?: string }
  ) {
    super(message, code, HTTP_STATUS.UNAUTHORIZED, options)
  }
}

export class AuthorizationError extends AppError {
  constructor(
    message: string = 'Access denied',
    options?: { requestId?: string }
  ) {
    super(message, ErrorCodes.FORBIDDEN, HTTP_STATUS.FORBIDDEN, options)
  }
}

export class NotFoundError extends AppError {
  constructor(
    resource: string = 'Resource',
    options?: { requestId?: string }
  ) {
    super(
      `${resource} not found`,
      ErrorCodes.NOT_FOUND,
      HTTP_STATUS.NOT_FOUND,
      options
    )
  }
}

export class ConflictError extends AppError {
  constructor(
    message: string = 'Resource already exists',
    options?: { requestId?: string }
  ) {
    super(message, ErrorCodes.ALREADY_EXISTS, HTTP_STATUS.CONFLICT, options)
  }
}

export class DatabaseError extends AppError {
  constructor(
    message: string = 'Database error',
    cause?: Error,
    options?: { requestId?: string }
  ) {
    super(
      message,
      ErrorCodes.DATABASE_ERROR,
      HTTP_STATUS.INTERNAL_ERROR,
      { ...options, cause }
    )
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfter?: number

  constructor(
    message: string = 'Rate limit exceeded',
    retryAfter?: number,
    options?: { requestId?: string }
  ) {
    super(
      message,
      ErrorCodes.RATE_LIMIT_EXCEEDED,
      HTTP_STATUS.TOO_MANY_REQUESTS,
      options
    )
    this.retryAfter = retryAfter
  }
}

export class TwilioError extends AppError {
  constructor(
    message: string = 'SMS service error',
    options?: { requestId?: string; details?: Record<string, unknown> }
  ) {
    super(
      message,
      ErrorCodes.TWILIO_ERROR,
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      options
    )
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(
    message: string = 'Service temporarily unavailable',
    options?: { requestId?: string }
  ) {
    super(
      message,
      ErrorCodes.SERVICE_UNAVAILABLE,
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      options
    )
  }
}

// ============================================================================
// API ERROR RESPONSE HELPER
// ============================================================================

export interface ApiErrorResponse {
  success: false
  error: string
  code: ErrorCode
  requestId: string
  details?: Record<string, unknown>
  retryAfter?: number
}

export function createErrorResponse(
  error: AppError | Error,
  includeStack: boolean = false
): NextResponse<ApiErrorResponse> {
  if (error instanceof AppError) {
    error.log()
    
    const body: ApiErrorResponse = {
      success: false,
      error: error.message,
      code: error.code,
      requestId: error.requestId,
    }

    if (error.details) {
      body.details = error.details
    }

    if (error instanceof RateLimitError && error.retryAfter) {
      body.retryAfter = error.retryAfter
    }

    const headers: Record<string, string> = {}
    if (error instanceof RateLimitError && error.retryAfter) {
      headers['Retry-After'] = String(error.retryAfter)
      headers['X-RateLimit-Reset'] = String(Date.now() + error.retryAfter * 1000)
    }

    return NextResponse.json(body, { status: error.statusCode, headers })
  }

  // Handle generic errors
  const requestId = crypto.randomUUID()
  logger.error(`[${requestId}] Unhandled error:`, error)

  return NextResponse.json(
    {
      success: false,
      error: 'Internal server error',
      code: ErrorCodes.INTERNAL_ERROR,
      requestId,
      ...(includeStack && process.env.NODE_ENV !== 'production' && error.stack
        ? { details: { stack: error.stack } }
        : {}),
    },
    { status: HTTP_STATUS.INTERNAL_ERROR }
  )
}

// ============================================================================
// ERROR RESPONSE FACTORIES
// ============================================================================

export const ErrorResponses = {
  unauthorized: (message = 'Unauthorized') =>
    createErrorResponse(new AuthenticationError(message)),

  forbidden: (message = 'Forbidden') =>
    createErrorResponse(new AuthorizationError(message)),

  notFound: (resource = 'Resource') =>
    createErrorResponse(new NotFoundError(resource)),

  badRequest: (message = 'Bad request') =>
    createErrorResponse(new ValidationError(message)),

  validationFailed: (errors: Record<string, string>) =>
    createErrorResponse(
      new ValidationError('Validation failed', errors)
    ),

  rateLimited: (retryAfter?: number) =>
    createErrorResponse(
      new RateLimitError('Too many requests', retryAfter)
    ),

  databaseError: (message?: string, cause?: Error) =>
    createErrorResponse(new DatabaseError(message, cause)),

  internalError: (details?: string) =>
    createErrorResponse(
      new AppError(
        'Internal server error',
        ErrorCodes.INTERNAL_ERROR,
        HTTP_STATUS.INTERNAL_ERROR,
        { details: details ? { info: details } : undefined }
      )
    ),

  serviceUnavailable: (message = 'Service temporarily unavailable') =>
    createErrorResponse(new ServiceUnavailableError(message)),

  twilioError: (message = 'SMS service error') =>
    createErrorResponse(new TwilioError(message)),
}

// ============================================================================
// ASYNC ERROR HANDLER WRAPPER
// ============================================================================

export type ApiHandler = (request: Request) => Promise<NextResponse>

export function withErrorHandling(
  handler: ApiHandler,
  options: { includeStack?: boolean } = {}
): ApiHandler {
  return async (request: Request) => {
    try {
      return await handler(request)
    } catch (error) {
      return createErrorResponse(
        error instanceof Error ? error : new Error(String(error)),
        options.includeStack
      )
    }
  }
}

// ============================================================================
// REQUEST CONTEXT FOR TRACKING
// ============================================================================

export interface RequestContext {
  requestId: string
  userId?: string
  path: string
  method: string
  startTime: number
}

export function createRequestContext(request: Request): RequestContext {
  return {
    requestId: crypto.randomUUID(),
    path: new URL(request.url).pathname,
    method: request.method,
    startTime: Date.now(),
  }
}

// ============================================================================
// USER-FRIENDLY ERROR MESSAGES
// ============================================================================

export const UserErrorMessages: Record<ErrorCode, string> = {
  [ErrorCodes.UNAUTHORIZED]: 'Please sign in to continue.',
  [ErrorCodes.FORBIDDEN]: "You don't have permission to perform this action.",
  [ErrorCodes.INVALID_TOKEN]: 'Your session is invalid. Please sign in again.',
  [ErrorCodes.TOKEN_EXPIRED]: 'Your session has expired. Please sign in again.',
  [ErrorCodes.SESSION_EXPIRED]: 'Your session has expired. Please sign in again.',
  [ErrorCodes.INVALID_CREDENTIALS]: 'Invalid email or password. Please try again.',
  [ErrorCodes.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCodes.VALIDATION_FAILED]: 'Please check your input and try again.',
  [ErrorCodes.MISSING_REQUIRED_FIELD]: 'Please fill in all required fields.',
  [ErrorCodes.INVALID_FORMAT]: 'Invalid format. Please check your input.',
  [ErrorCodes.INVALID_PHONE]: 'Please enter a valid phone number.',
  [ErrorCodes.INVALID_EMAIL]: 'Please enter a valid email address.',
  [ErrorCodes.INVALID_DATE]: 'Please enter a valid date.',
  [ErrorCodes.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCodes.ALREADY_EXISTS]: 'This information already exists.',
  [ErrorCodes.RESOURCE_CONFLICT]: 'This resource conflicts with existing data.',
  [ErrorCodes.DATABASE_ERROR]: 'Something went wrong. Please try again.',
  [ErrorCodes.DATABASE_CONNECTION]: 'Unable to connect to the server. Please check your connection.',
  [ErrorCodes.DATABASE_TIMEOUT]: 'The request took too long. Please try again.',
  [ErrorCodes.PERMISSION_DENIED]: "You don't have permission to perform this action.",
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait a moment and try again.',
  [ErrorCodes.TOO_MANY_REQUESTS]: 'Too many requests. Please wait a moment and try again.',
  [ErrorCodes.TWILIO_ERROR]: 'Unable to send message. Please try again.',
  [ErrorCodes.SMS_SEND_FAILED]: 'Unable to send message. Please try again.',
  [ErrorCodes.INVALID_PHONE_NUMBER]: 'Invalid phone number. Please check and try again.',
  [ErrorCodes.PROVISIONING_FAILED]: 'Unable to provision phone number. Please try again.',
  [ErrorCodes.NUMBER_UNAVAILABLE]: 'Phone number unavailable. Please try a different area code.',
  [ErrorCodes.INTERNAL_ERROR]: 'Something went wrong. Our team has been notified.',
  [ErrorCodes.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable. Please try again later.',
  [ErrorCodes.NOT_IMPLEMENTED]: 'This feature is not yet available.',
}

export function getUserErrorMessage(code: ErrorCode): string {
  return UserErrorMessages[code] || 'Something went wrong. Please try again.'
}
