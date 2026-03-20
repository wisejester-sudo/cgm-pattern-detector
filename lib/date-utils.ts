/**
 * Date utility functions with timezone support
 * Ensures consistent date handling across server and client
 */

/**
 * Get today's date in UTC, normalized to midnight
 * Use this for database queries and comparisons
 */
export function getTodayUTC(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0))
}

/**
 * Get today's date in local timezone, normalized to midnight
 * Use this for displaying "today" to users
 */
export function getTodayLocal(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
}

/**
 * Normalize a date to midnight UTC for consistent comparisons
 */
export function normalizeDateUTC(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date.getTime())
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0))
}

/**
 * Normalize a date to midnight in local timezone
 */
export function normalizeDateLocal(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date.getTime())
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
}

/**
 * Check if two dates are the same day (UTC comparison)
 * Use this for database-stored dates (usually UTC)
 */
export function isSameDayUTC(date1: Date | string, date2: Date | string): boolean {
  const d1 = normalizeDateUTC(date1)
  const d2 = normalizeDateUTC(date2)
  return d1.getTime() === d2.getTime()
}

/**
 * Check if two dates are the same day (local comparison)
 * Use this for user-facing comparisons
 */
export function isSameDayLocal(date1: Date | string, date2: Date | string): boolean {
  const d1 = normalizeDateLocal(date1)
  const d2 = normalizeDateLocal(date2)
  return d1.getTime() === d2.getTime()
}

/**
 * Check if a date is today (UTC)
 */
export function isTodayUTC(date: Date | string): boolean {
  return isSameDayUTC(date, getTodayUTC())
}

/**
 * Check if a date is today (local)
 */
export function isTodayLocal(date: Date | string): boolean {
  return isSameDayLocal(date, getTodayLocal())
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  })
}

/**
 * Format a datetime for display
 */
export function formatDateTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  })
}

/**
 * Calculate days between two dates
 */
export function daysBetween(start: Date | string, end: Date | string): number {
  const startDate = normalizeDateUTC(start)
  const endDate = normalizeDateUTC(end)
  const diffTime = endDate.getTime() - startDate.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Get the start and end of a day in UTC (for database queries)
 */
export function getDayRangeUTC(date: Date | string): { start: Date; end: Date } {
  const d = typeof date === 'string' ? new Date(date) : new Date(date.getTime())
  const start = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0))
  const end = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999))
  return { start, end }
}

/**
 * Get the start and end of today in UTC (for database queries)
 */
export function getTodayRangeUTC(): { start: Date; end: Date } {
  return getDayRangeUTC(getTodayUTC())
}
