"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"
import * as Sentry from "@sentry/nextjs"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
  context?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary for data fetching operations
 * Catches errors in child components and provides recovery UI
 */
export class DataErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[DataErrorBoundary] Uncaught error:", error, errorInfo)
    
    // Report to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
        data: {
          context: this.props.context,
        },
      },
    })

    this.setState({ errorInfo })
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    this.props.onReset?.()
  }

  private handleRetry = () => {
    // Reload the page as a last resort
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="min-h-[200px] flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-destructive/10 w-fit">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Data Loading Error</CardTitle>
              <CardDescription>
                We encountered an error while loading your data. Please try again.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error?.message && (
                <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground font-mono break-all">
                  {this.state.error.message}
                </div>
              )}
              <div className="flex gap-3">
                <Button onClick={this.handleReset} variant="outline" className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleRetry} className="flex-1">
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook for handling async data errors
 */
export function useDataErrorHandler() {
  const handleError = (error: unknown, context: string) => {
    const message = error instanceof Error ? error.message : "Unknown error occurred"
    console.error(`[Data Error - ${context}]:`, error)
    
    Sentry.captureException(error, {
      tags: { context },
      extra: { message },
    })
    
    return {
      error: true,
      message,
      context,
    }
  }

  return { handleError }
}

/**
 * Async error wrapper for data operations
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string,
  onError?: (error: Error) => void
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const data = await operation()
    return { data, error: null }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error(`[${context}] Operation failed:`, err)
    Sentry.captureException(err, { tags: { context } })
    onError?.(err)
    return { data: null, error: err }
  }
}
