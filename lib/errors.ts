import { NextResponse } from "next/server"

/**
 * Standardized API Error Response
 */
export interface ApiError {
  error: string
  code?: string
  details?: string
}

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
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

/**
 * Error codes for client-side handling
 */
export const ERROR_CODES = {
  // Auth errors
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INVALID_TOKEN: "INVALID_TOKEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  
  // Validation errors
  VALIDATION_FAILED: "VALIDATION_FAILED",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
  INVALID_FORMAT: "INVALID_FORMAT",
  
  // Resource errors
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  
  // Server errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  message: string,
  status: number = HTTP_STATUS.INTERNAL_ERROR,
  code?: string,
  details?: string
): NextResponse {
  const body: ApiError = { error: message }
  if (code) body.code = code
  if (details && process.env.NODE_ENV !== "production") {
    body.details = details
  }
  return NextResponse.json(body, { status })
}

/**
 * Common error responses
 */
export const ErrorResponses = {
  unauthorized: (message = "Unauthorized") =>
    createErrorResponse(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED),
  
  forbidden: (message = "Forbidden") =>
    createErrorResponse(message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN),
  
  notFound: (resource = "Resource") =>
    createErrorResponse(`${resource} not found`, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND),
  
  badRequest: (message = "Bad request") =>
    createErrorResponse(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_FAILED),
  
  validationFailed: (errors: string[]) =>
    createErrorResponse(
      `Validation failed: ${errors.join(", ")}`,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_FAILED
    ),
  
  rateLimited: (retryAfter?: number) => {
    const response = createErrorResponse(
      "Rate limit exceeded. Please try again later.",
      HTTP_STATUS.TOO_MANY_REQUESTS,
      ERROR_CODES.RATE_LIMIT_EXCEEDED
    )
    if (retryAfter) {
      response.headers.set("Retry-After", String(retryAfter))
    }
    return response
  },
  
  internalError: (details?: string) =>
    createErrorResponse(
      "Internal server error",
      HTTP_STATUS.INTERNAL_ERROR,
      ERROR_CODES.INTERNAL_ERROR,
      details
    ),
  
  serviceUnavailable: (message = "Service temporarily unavailable") =>
    createErrorResponse(message, HTTP_STATUS.SERVICE_UNAVAILABLE, ERROR_CODES.SERVICE_UNAVAILABLE),
  
  payloadTooLarge: (maxSize: string) =>
    createErrorResponse(
      `Request body too large (max ${maxSize})`,
      HTTP_STATUS.PAYLOAD_TOO_LARGE
    ),
} as const

/**
 * Wrap async handler with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error("[API] Unhandled error:", error)
      return ErrorResponses.internalError(
        error instanceof Error ? error.message : undefined
      )
    }
  }) as T
}
