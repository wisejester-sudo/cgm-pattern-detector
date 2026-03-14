"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import Link from "next/link"
import { Zap, AlertCircle, CheckCircle, Mail } from "lucide-react"
import { createClient, createClientAsync } from "@/lib/supabase/client"
import { useStore } from "@/lib/store"

type SignupStep = "form" | "success" | "confirm_email"

export default function SignupPage() {
  const router = useRouter()
  const { resetStore } = useStore()

  const [step, setStep] = useState<SignupStep>("form")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyPhone, setCompanyPhone] = useState("")

  // Clear any existing session/store data on signup page
  useEffect(() => {
    resetStore()
  }, [resetStore])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

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
      // Try to create Supabase client - try async version first that can fetch config
      let supabase
      try {
        supabase = await createClientAsync()
      } catch (clientError) {
        console.error("[v0] Failed to create Supabase client:", clientError)
        setError("Database configuration error. Please ensure Supabase is properly configured.")
        setLoading(false)
        return
      }

      // Sign up directly via browser client — this correctly sets the session cookie
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/`,
          data: {
            full_name: ownerName || email.split('@')[0],
            company_name: companyName,
            company_phone: companyPhone,
            role: 'admin',
          },
        },
      })

      if (authError) {
        console.error("[v0] Signup auth error:", authError)
        setError(authError.message || "Signup failed")
        setLoading(false)
        return
      }

      if (!data.user) {
        setError("Signup failed. Please try again.")
        setLoading(false)
        return
      }

      // If a session was returned, email confirmation is disabled — go straight to dashboard
      if (data.session) {
        setStep("success")
        setTimeout(() => {
          router.push("/")
          router.refresh()
        }, 1500)
      } else {
        // Email confirmation required
        setStep("confirm_email")
      }
    } catch (error) {
      console.error("[v0] Signup error:", error)
      const errorMessage = error instanceof Error ? error.message : "An error occurred. Please try again."
      setError(errorMessage)
      setLoading(false)
    }
  }

  if (step === "confirm_email") {
    return (
      <div className="min-h-screen bg-sidebar flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
              <Mail className="h-7 w-7 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>
              We sent a confirmation link to{" "}
              <span className="font-medium text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the link in your email to verify your account, then log in to start using Dispatchly.
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Company registered</p>
              <p className="font-semibold">{companyName}</p>
            </div>
            <Link href="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
            <p className="text-xs text-muted-foreground">
              {"Didn't receive the email? Check your spam folder."}
            </p>
          </CardContent>
        </Card>
      </div>
    )
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
            <CardDescription>Your account has been created.</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-1">
              <p className="text-xs text-muted-foreground">Company</p>
              <p className="font-semibold">{companyName}</p>
              <p className="text-xs text-muted-foreground mt-1">Phone</p>
              <p className="font-semibold">{companyPhone}</p>
            </div>
            <p className="text-sm text-muted-foreground">Taking you to your dashboard...</p>
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
          <CardDescription>Set up your HVAC business in minutes</CardDescription>
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
                  onChange={(e) => { setEmail(e.target.value); setError(null) }}
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
                  onChange={(e) => { setPassword(e.target.value); setError(null) }}
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
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(null) }}
                  required
                />
              </Field>

              <div className="border-t pt-4 mt-2">
                <p className="text-sm font-medium text-muted-foreground mb-3">Company Details</p>
              </div>

              <Field>
                <FieldLabel htmlFor="ownerName">Your Name <span className="text-muted-foreground font-normal">(optional)</span></FieldLabel>
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
                  placeholder="Smith HVAC Services"
                  value={companyName}
                  onChange={(e) => { setCompanyName(e.target.value); setError(null) }}
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
                  onChange={(e) => { setCompanyPhone(e.target.value); setError(null) }}
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
