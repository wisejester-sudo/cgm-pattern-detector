"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import Link from "next/link"
import { Zap, AlertCircle, CheckCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type SignupStep = "account" | "company" | "success"

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<SignupStep>("account")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Account form
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Company form
  const [companyName, setCompanyName] = useState("")
  const [companyPhone, setCompanyPhone] = useState("")
  const [companyAddress, setCompanyAddress] = useState("")

  const handleAccountSubmit = (e: React.FormEvent) => {
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

    setStep("company")
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Create auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            role: "admin",
            company_name: companyName,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // 2. Create company record (mock - in real app would create in database)
        // For now, just show success and redirect
        setStep("success")

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/dashboard")
          router.refresh()
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account")
      setLoading(false)
    }
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-sidebar flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-status-complete/10">
              <CheckCircle className="h-7 w-7 text-status-complete" />
            </div>
            <CardTitle className="text-2xl">Welcome to Dispatchly!</CardTitle>
            <CardDescription>
              Your account has been created successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Company:</p>
              <p className="font-medium">{companyName}</p>
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
          <Tabs value={step} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account" disabled={step === "company"}>
                Account
              </TabsTrigger>
              <TabsTrigger value="company" disabled={step === "account"}>
                Company
              </TabsTrigger>
            </TabsList>

            {/* Account Step */}
            <TabsContent value="account">
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <form onSubmit={handleAccountSubmit}>
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

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!email || !password || !confirmPassword}
                  >
                    Continue
                  </Button>
                </FieldGroup>
              </form>
            </TabsContent>

            {/* Company Step */}
            <TabsContent value="company">
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <form onSubmit={handleSignup}>
                <FieldGroup>
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

                  <Field>
                    <FieldLabel htmlFor="address">Service Address (Optional)</FieldLabel>
                    <Input
                      id="address"
                      placeholder="123 Main St, City, State ZIP"
                      value={companyAddress}
                      onChange={(e) => {
                        setCompanyAddress(e.target.value)
                        setError(null)
                      }}
                    />
                  </Field>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep("account")}
                      disabled={loading}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={!companyName || !companyPhone || loading}
                    >
                      {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </TabsContent>
          </Tabs>

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
