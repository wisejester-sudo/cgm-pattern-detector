"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import Link from "next/link"
import { Zap, AlertCircle, CheckCircle } from "lucide-react"
import { useStore } from "@/lib/store"

type SignupStep = "form" | "success"

export default function SignupPage() {
  const router = useRouter()
  const resetStore = useStore(state => state.resetStore)

  const [step, setStep] = useState<SignupStep>("form")
  
  // Clear any existing store data when visiting signup page
  useEffect(() => {
    resetStore()
  }, [resetStore])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // All form fields on one page
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyPhone, setCompanyPhone] = useState("")

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          ownerName: ownerName || email.split('@')[0],
          companyName,
          companyPhone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Signup failed")
        setLoading(false)
        return
      }

      setStep("success")
      
      // Redirect directly to dashboard after successful signup
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  if (step === "success") {
    const displayName = ownerName || email.split('@')[0]
    return (
      <div className="min-h-screen bg-sidebar flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
              <CheckCircle className="h-7 w-7 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Welcome, {displayName}!</CardTitle>
            <CardDescription>
              Your account has been created successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Company</p>
                <p className="font-medium">{companyName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{companyPhone}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Redirecting to your dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sidebar flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center w-12 h-12 rounded-lg bg-primary">
            <Zap className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Create Dispatchly Account</CardTitle>
          <CardDescription>
            Set up your HVAC business in minutes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError(null)
                  }}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError(null)
                  }}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="confirm">Confirm Password</FieldLabel>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setError(null)
                  }}
                  required
                />
              </Field>

              <div className="border-t pt-4 mt-2">
                <p className="text-sm font-medium text-muted-foreground mb-3">Company Details</p>
              </div>

              <Field>
                <FieldLabel htmlFor="ownerName">Your Name (Optional)</FieldLabel>
                <Input
                  id="ownerName"
                  placeholder="John Smith"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="company">Company Name</FieldLabel>
                <Input
                  id="company"
                  placeholder="Your HVAC Company"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value)
                    setError(null)
                  }}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="phone">Company Phone</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={companyPhone}
                  onChange={(e) => {
                    setCompanyPhone(e.target.value)
                    setError(null)
                  }}
                  required
                />
              </Field>

              <Button
                type="submit"
                className="w-full"
                disabled={!email || !password || !confirmPassword || !companyName || !companyPhone || loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </FieldGroup>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Log in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
