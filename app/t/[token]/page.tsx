'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

export default function TechnicianAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const router = useRouter()
  const { token } = use(params)
  
  const [step, setStep] = useState<'validate' | 'setup' | 'complete'>('validate')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [technicianName, setTechnicianName] = useState('')
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch('/api/auth/validate-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        if (!response.ok) {
          setError('Invalid or expired invite link')
          setStep('validate')
          setIsLoading(false)
          return
        }

        const data = await response.json()
        setTechnicianName(data.name || 'Technician')
        // Store token in localStorage for session persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('tech_magic_token', token)
          localStorage.setItem('tech_name', data.name || 'Technician')
        }
        setStep('setup')
      } catch (err) {
        console.error('[v0] Token validation error:', err)
        setError('Failed to validate invite link')
      } finally {
        setIsLoading(false)
      }
    }

    validateToken()
  }, [token])

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits')
      return
    }

    if (pin !== pinConfirm) {
      setError('PINs do not match')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/technicians/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, pin }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to accept invite')
        setIsLoading(false)
        return
      }

      setStep('complete')
      setTimeout(() => router.push('/tech'), 2000)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  if (isLoading && step === 'validate') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Validating invite...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && step === 'validate') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl">Invalid Invite</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-center text-muted-foreground">{error}</p>
            <Button onClick={() => router.push('/')} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Complete Your Account</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Set up your technician PIN</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetup} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Name</FieldLabel>
                  <Input value={technicianName} disabled className="bg-muted" />
                </Field>

                <Field>
                  <FieldLabel>Mobile PIN (4+ digits)</FieldLabel>
                  <Input
                    type="password"
                    inputMode="numeric"
                    placeholder="Enter PIN"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value.replace(/\D/g, ''))
                      setError('')
                    }}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    You'll use this PIN to log in on mobile
                  </p>
                </Field>

                <Field>
                  <FieldLabel>Confirm PIN</FieldLabel>
                  <Input
                    type="password"
                    inputMode="numeric"
                    placeholder="Confirm PIN"
                    value={pinConfirm}
                    onChange={(e) => {
                      setPinConfirm(e.target.value.replace(/\D/g, ''))
                      setError('')
                    }}
                    required
                  />
                </Field>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button type="submit" className="w-full" disabled={isLoading || !pin || !pinConfirm}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    'Complete Setup'
                  )}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome!</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="text-center text-muted-foreground">
              Your account has been set up successfully. Redirecting...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
}
