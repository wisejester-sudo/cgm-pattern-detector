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
 * Search for addresses using Photon API
 */
export async function searchAddresses(query: string, limit: number = 5): Promise<AddressSearchResult> {
  if (!query || query.length < 3) {
    return { suggestions: [] }
  }

  try {
    // Add country bias for US/Canada (change as needed)
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=${limit}&lang=en`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Photon API error: ${response.status}`)
    }

    const data = await response.json()
    
    const suggestions: AddressSuggestion[] = data.features.map((feature: any, index: number) => {
      const props = feature.properties
      const coords = feature.geometry.coordinates
      
      // Build full address from components
      const parts = []
      if (props.housenumber && props.street) {
        parts.push(`${props.housenumber} ${props.street}`)
      } else if (props.street) {
        parts.push(props.street)
      } else if (props.name) {
        parts.push(props.name)
      }
      
      if (props.city) parts.push(props.city)
      if (props.state) parts.push(props.state)
      if (props.postcode) parts.push(props.postcode)
      if (props.country) parts.push(props.country)
      
      return {
        id: `${props.osm_id || index}`,
        name: props.name || props.street || query,
        fullAddress: parts.join(', '),
        street: props.street,
        housenumber: props.housenumber,
        city: props.city,
        state: props.state,
        postcode: props.postcode,
        country: props.country,
        lat: coords[1],
        lon: coords[0],
      }
    })

    return { suggestions }
    
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
