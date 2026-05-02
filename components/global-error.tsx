"use client"

import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"
import Link from "next/link"

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Global Error Component
 * 
 * Catches and displays unhandled errors at the root level.
 * Reports errors to Sentry and provides user-friendly recovery options.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error to console for debugging
    console.error("[Dispatchly Global Error]", error)
    
    // Report error to Sentry with additional context
    Sentry.captureException(error, {
      tags: {
        errorBoundary: "global",
        digest: error.digest,
      },
      extra: {
        digest: error.digest,
        stack: error.stack,
      },
    })
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 p-4 rounded-full bg-destructive/10 w-fit">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Something went wrong</CardTitle>
            <CardDescription className="text-base mt-2">
              An unexpected error occurred in the application. 
              We&apos;ve been notified and are working on a fix.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Error details (only in development) */}
            {process.env.NODE_ENV === "development" && (
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Bug className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Debug Info</span>
                </div>
                <div className="text-sm font-mono text-destructive break-all">
                  {error.message}
                </div>
                {error.digest && (
                  <div className="text-xs text-muted-foreground">
                    Error ID: {error.digest}
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={reset} 
                variant="outline" 
                className="flex-1 h-11"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                asChild 
                className="flex-1 h-11"
              >
                <Link href="/dashboard">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Link>
              </Button>
            </div>

            {/* Support link */}
            <p className="text-center text-sm text-muted-foreground">
              If this persists, please{" "}
              <Link 
                href="/contact" 
                className="text-primary hover:underline font-medium"
              >
                contact support
              </Link>
              {error.digest && (
                <span className="block mt-1 text-xs">
                  Reference: {error.digest}
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </body>
    </html>
  )
}
