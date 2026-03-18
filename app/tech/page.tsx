'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Wrench, MessageSquare, Phone, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function TechnicianPortalLanding() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRequestLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/technicians/request-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })

      if (response.ok) {
        setSent(true)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to send magic link')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Check Your Phone!</CardTitle>
            <CardDescription>
              We've sent a magic link to {phone}. Tap the link in the SMS to access your jobs.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Didn't receive it? Check your spam folder or try again.
            </p>
            <Button variant="outline" onClick={() => setSent(false)} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-primary">
            <Wrench className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Technician Portal</CardTitle>
          <CardDescription>
            Access your assigned jobs and update your status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* How it works */}
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Magic Link via SMS</p>
                <p>Your dispatcher sends you a unique link by text message</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Tap to Access</p>
                <p>Click the link in your SMS to view jobs without a password</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <p className="text-sm font-medium text-foreground mb-4">
              Lost your magic link? Request a new one:
            </p>

            <form onSubmit={handleRequestLink}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!phone || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Magic Link'
                  )}
                </Button>
              </div>
            </form>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Are you an admin?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
