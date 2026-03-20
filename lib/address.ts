/**
 * Address Search Service using Photon by Komoot
 * 
 * Free, open-source geocoding and autocomplete
 * No API key required for reasonable usage
 * 
 * Rate limits: Be nice, don't abuse (1 request per second recommended)
 * https://photon.komoot.io
 */

export interface AddressSuggestion {
  id: string
  name: string
  fullAddress: string
  street?: string
  housenumber?: string
  city?: string
  state?: string
  postcode?: string
  country?: string
  lat: number
  lon: number
}

export interface AddressSearchResult {
  suggestions: AddressSuggestion[]
  error?: string
}

/**
 * Search for addresses using local proxy API
 * 
 * Uses /api/address/search to avoid CSP issues with direct Photon calls
 */
export async function searchAddresses(query: string, limit: number = 5): Promise<AddressSearchResult> {
  if (!query || query.length < 2) {
    return { suggestions: [] }
  }

  try {
    // Use local proxy API (no CSP issues)
    const url = `/api/address/search?q=${encodeURIComponent(query)}&limit=${limit}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Search failed: ${response.status}`)
    }

    const data = await response.json()
    
    return { suggestions: data.suggestions || [] }
    
  } catch (error) {
    console.error('Address search error:', error)
    return { 
      suggestions: [], 
      error: 'Failed to search addresses. Please try again.' 
    }
  }
}

/**
 * Debounce helper for address search
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Format address for display
 */
export function formatAddress(suggestion: AddressSuggestion): string {
  return suggestion.fullAddress
}

/**
 * Validate if an address looks complete
 */
export function isValidAddress(address: string): boolean {
  // Basic validation: must have at least street and city (comma separated)
  const parts = address.split(',').map(p => p.trim()).filter(Boolean)
  return parts.length >= 2 && address.length > 10
}
