"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Smartphone } from "lucide-react"
import { useStore } from "@/lib/store"

export default function TechLoginPage() {
  const router = useRouter()
  const { loginTechnician } = useStore()
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const tech = loginTechnician(pin)

    if (tech) {
      router.push("/tech/jobs")
    } else {
      setError("Invalid PIN. Please try again.")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-sidebar flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Dispatchly</CardTitle>
          <CardDescription>
            Enter your PIN to access your jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="pin">Technician PIN</FieldLabel>
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter 4-digit PIN"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                    setError("")
                  }}
                  className="text-center text-2xl tracking-[0.5em]"
                />
                {error && (
                  <p className="text-sm text-destructive mt-1">{error}</p>
                )}
              </Field>
              <Button
                type="submit"
                className="w-full"
                disabled={pin.length !== 4 || isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <p className="text-sm text-sidebar-muted mt-4">
        Demo PINs: 1234 or 5678
      </p>
    </div>
  )
}
