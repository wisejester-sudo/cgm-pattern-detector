"use client"

import { useStore } from "@/lib/store"

/**
 * Hook to get the company's brand color from settings
 * Returns the primary_color or falls back to default
 */
export function useBrandColor() {
  const { settings } = useStore()
  return settings.primary_color || "#3b82f6"
}

/**
 * Hook to get all branding settings
 */
export function useBranding() {
  const { settings } = useStore()
  return {
    primaryColor: settings.primary_color || "#3b82f6",
    logoUrl: settings.logo_url,
    tagline: settings.tagline,
    companyName: settings.company_name,
  }
}
