"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import Link from "next/link"
import { Zap, Eye, EyeOff, AlertCircle } from "lucide-react"
import { createClient, createClientAsync } from "@/lib/supabase/client"
import { useStore } from "@/lib/store"

export default function LoginPage() {
  const router = useRouter()
  const { resetStore } = useStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Clear old store data on login page visit
  useEffect(() => {
    resetStore()
  }, [resetStore])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

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

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error("[v0] Login auth error:", authError)
        setError(authError.message || "Invalid email or password")
        setLoading(false)
        return
      }

      if (!data.user) {
        setError("Login failed. Please try again.")
        setLoading(false)
        return
      }

      // Navigate to dashboard — session cookie is now set by the browser client
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("[v0] Login error:", error)
      const errorMessage = error instanceof Error ? error.message : "An error occurred. Please try again."
      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-sidebar flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center w-12 h-12 rounded-lg bg-primary">
            <Zap className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Welcome to Dispatchly</CardTitle>
          <CardDescription>
            Sign in to your admin account to manage your business
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin}>
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
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center justify-between mb-2">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError(null)
                    }}
                    disabled={loading}
                    autoComplete="current-password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Field>

              <Button
                type="submit"
                className="w-full"
                disabled={!email || !password || loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </FieldGroup>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/signup" className="text-primary hover:underline font-medium">
                Sign up for free
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <Link
          href="/tech"
          className="text-sm text-sidebar-muted hover:text-sidebar-foreground"
        >
          Are you a technician? Sign in here
        </Link>
      </div>
    </div>
  )
}
