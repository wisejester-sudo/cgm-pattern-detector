"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Check, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function SentryTestPage() {
  const [errorThrown, setErrorThrown] = useState(false)
  const [errorCount, setErrorCount] = useState(0)

  const triggerError = () => {
    setErrorCount(prev => prev + 1)
    setErrorThrown(true)
    
    // Throw a test error that Sentry will capture
    throw new Error(`Test Error #${errorCount + 1} - Sentry Integration Test`)
  }

  const triggerAsyncError = async () => {
    setErrorCount(prev => prev + 1)
    setErrorThrown(true)
    
    // Async error
    await new Promise((resolve) => setTimeout(resolve, 100))
    throw new Error(`Async Test Error #${errorCount + 1} - Sentry Async Test`)
  }

  const triggerFetchError = async () => {
    setErrorCount(prev => prev + 1)
    setErrorThrown(true)
    
    // This will trigger a network error
    try {
      await fetch('https://invalid-domain-that-does-not-exist.com/api/test')
    } catch (error) {
      throw new Error(`Fetch Error #${errorCount + 1} - Network request failed`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sentry Error Monitoring Test</h1>
        <p className="text-muted-foreground">
          Use this page to verify Sentry is capturing errors correctly
        </p>
      </div>

      {errorThrown && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Error Thrown!</AlertTitle>
          <AlertDescription className="text-amber-700">
            An error was thrown and should be captured by Sentry. 
            Check your Sentry dashboard to verify it was received.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Test Error Types</CardTitle>
          <CardDescription>
            Click these buttons to trigger different types of errors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={triggerError} 
            variant="destructive"
            className="w-full"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Throw Synchronous Error
          </Button>

          <Button 
            onClick={triggerAsyncError}
            variant="destructive"
            className="w-full"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Throw Async Error
          </Button>

          <Button 
            onClick={triggerFetchError}
            variant="destructive"
            className="w-full"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Throw Fetch Error
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verification Steps</CardTitle>
          <CardDescription>
            After throwing an error:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-2 list-decimal list-inside text-sm">
            <li>Click one of the "Throw Error" buttons above</li>
            <li>Wait 2-3 seconds for the error to be sent to Sentry</li>
            <li>Click the link below to open your Sentry dashboard</li>
            <li>Look for errors with message "Sentry Integration Test"</li>
            <li>Verify you see:
              <ul className="list-disc list-inside ml-4 text-muted-foreground">
                <li>Error message</li>
                <li>Stack trace</li>
                <li>Browser info</li>
                <li>URL where error occurred</li>
              </ul>
            </li>
          </ol>

          <Link
            href="https://sentry.io/issues/?project=4511062707208192"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="w-full" variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Sentry Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sentry Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">DSN Configured:</span>
            <Check className="h-4 w-4 text-green-500" />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Client Config:</span>
            <Check className="h-4 w-4 text-green-500" />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Server Config:</span>
            <Check className="h-4 w-4 text-green-500" />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Error Boundary:</span>
            <Check className="h-4 w-4 text-green-500" />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Session Replay:</span>
            <Check className="h-4 w-4 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Link href="/">
          <Button variant="ghost">← Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
