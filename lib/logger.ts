/**
 * Production-safe logging utility
 * Only logs in development mode to avoid leaking sensitive data
 */

const isDev = process.env.NODE_ENV === "development"

export const logger = {
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug("[DEBUG]", ...args)
    }
  },
  
  info: (...args: any[]) => {
    if (isDev) {
      console.info("[INFO]", ...args)
    }
  },
  
  warn: (...args: any[]) => {
    // Always log warnings, but in structured format in production
    if (isDev) {
      console.warn("[WARN]", ...args)
    } else {
      // In production, could send to logging service
      console.warn(JSON.stringify({ level: "warn", timestamp: new Date().toISOString(), args }))
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors, but sanitize in production
    const sanitized = args.map(arg => {
      if (arg instanceof Error) {
        return { message: arg.message, stack: isDev ? arg.stack : undefined }
      }
      return arg
    })
    
    if (isDev) {
      console.error("[ERROR]", ...sanitized)
    } else {
      console.error(JSON.stringify({ 
        level: "error", 
        timestamp: new Date().toISOString(),
        args: sanitized 
      }))
    }
  },
  
  // API-specific logging
  api: {
    request: (method: string, path: string, userId?: string) => {
      if (isDev) {
        console.log(`[API] ${method} ${path}${userId ? ` (user: ${userId})` : ""}`)
      }
    },
    
    response: (method: string, path: string, status: number, durationMs: number) => {
      if (isDev) {
        console.log(`[API] ${method} ${path} → ${status} (${durationMs}ms)`)
      }
    },
    
    error: (method: string, path: string, error: Error) => {
      logger.error(`[API] ${method} ${path} failed:`, error.message)
    }
  }
}

export default logger
