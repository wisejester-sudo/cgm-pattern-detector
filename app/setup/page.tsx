'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { CheckCircle2, Loader2 } from 'lucide-react'

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<'company' | 'owner' | 'complete'>('company')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [companyData, setCompanyData] = useState({
    companyName: '',
    companyPhone: '',
    companyAddress: '',
  })

  const [ownerData, setOwnerData] = useState({
    ownerName: '',
    ownerPhone: '',
  })

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/setup/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to save company info')
        setIsLoading(false)
        return
      }

      setStep('owner')
    } catch (err) {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const handleOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/setup/owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ownerData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to save owner info')
        setIsLoading(false)
        return
      }

      setStep('complete')
      setTimeout(() => router.push('/'), 2000)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {step === 'company' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Company Information</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">Set up your company details</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCompanySubmit} className="space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Company Name</FieldLabel>
                    <Input
                      placeholder="Your Company"
                      value={companyData.companyName}
                      onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Phone Number</FieldLabel>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={companyData.companyPhone}
                      onChange={(e) => setCompanyData({ ...companyData, companyPhone: e.target.value })}
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Address</FieldLabel>
                    <Input
                      placeholder="123 Main St, City, State 12345"
                      value={companyData.companyAddress}
                      onChange={(e) => setCompanyData({ ...companyData, companyAddress: e.target.value })}
                      required
                    />
                  </Field>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Continue'
                    )}
                  </Button>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'owner' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Account Owner</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">Who is the account owner?</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOwnerSubmit} className="space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Owner Name</FieldLabel>
                    <Input
                      placeholder="John Doe"
                      value={ownerData.ownerName}
                      onChange={(e) => setOwnerData({ ...ownerData, ownerName: e.target.value })}
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Owner Phone</FieldLabel>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 987-6543"
                      value={ownerData.ownerPhone}
                      onChange={(e) => setOwnerData({ ...ownerData, ownerPhone: e.target.value })}
                      required
                    />
                  </Field>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep('company')}
                    >
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Completing...
                        </>
                      ) : (
                        'Complete Setup'
                      )}
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'complete' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Setup Complete</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-center text-muted-foreground">
                Your account has been set up successfully. Redirecting...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
