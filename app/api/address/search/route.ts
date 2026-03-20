/**
 * Address Search Proxy API
 * 
 * Proxies requests to Photon by Komoot to avoid CSP issues.
 * Server-side calls don't have CSP restrictions.
 * 
 * GET /api/address/search?q=query&limit=5
 */

import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const limit = Math.min(10, Math.max(1, parseInt(searchParams.get("limit") || "5", 10)))
    
    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Query must be at least 2 characters" },
        { status: 400 }
      )
    }
    
    // Call Photon API server-side (no CSP issues)
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=${limit}&lang=en`
    
    const response = await fetch(photonUrl, {
      headers: {
        "Accept": "application/json",
      },
    })
    
    if (!response.ok) {
      console.error("Photon API error:", response.status, await response.text())
      return NextResponse.json(
        { error: "Address search service unavailable" },
        { status: 503 }
      )
    }
    
    const data = await response.json()
    
    // Transform the response to a cleaner format
    const suggestions = data.features.map((feature: any) => {
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
      
      return {
        id: `${props.osm_id || Math.random().toString(36)}`,
        name: props.name || props.street || query,
        fullAddress: parts.join(", "),
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
    
    return NextResponse.json({ suggestions })
    
  } catch (error) {
    console.error("Address search error:", error)
    return NextResponse.json(
      { error: "Failed to search addresses" },
      { status: 500 }
    )
  }
}

// Rate limiting - simple in-memory rate limit
const rateLimits = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 30 // requests per minute
const RATE_WINDOW = 60 * 1000 // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimits.get(ip)
  
  if (!limit || now > limit.resetTime) {
    rateLimits.set(ip, { count: 1, resetTime: now + RATE_WINDOW })
    return true
  }
  
  if (limit.count >= RATE_LIMIT) {
    return false
  }
  
  limit.count++
  return true
}
