"use client"

import { Loader2 } from "lucide-react"

/**
 * Global Loading State
 * 
 * Displayed while Next.js is loading route segments.
 * Shows a centered spinner with Dispatchly branding.
 */
export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xl">D</span>
        </div>
        <span className="font-semibold text-2xl">Dispatchly</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    </div>
  )
}
