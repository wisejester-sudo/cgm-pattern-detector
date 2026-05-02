"use client"

import GlobalErrorComponent from "@/components/global-error"

/**
 * Global Error Boundary
 * 
 * Next.js convention: global-error.tsx in app root catches
 * errors that escape all other boundaries.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <GlobalErrorComponent error={error} reset={reset} />
}
