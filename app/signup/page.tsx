"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Zap, Eye, EyeOff, Check } from "lucide-react"
import type { SubscriptionPlan } from "@/lib/types"

const plans: { id: SubscriptionPlan; name: string; price: number; features: string[] }[] = [
  {
    id: "starter",
    name: "Starter",
    price: 39,
    features: [
      "Up to 3 technicians",
      "100 SMS/month",
      "Job tracking",
      "Customer notifications",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 79,
    features: [
      "Unlimited technicians",
      "500 SMS/month",
      "Priority support",
      "Custom branding",
      "Advanced reports",
    ],
  },
]

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // Form state
  const [companyName, setCompanyName] = useState("")
  const [adminName, setAdminName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>("starter")
  
  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    if (!companyName.trim()) newErrors.companyName = "Company name is required"
    if (!adminName.trim()) newErrors.adminName = "Your name is required"
    if (!email.trim()) newErrors.email = "Email is required"
    if (!email.includes("@")) newErrors.email = "Please enter a valid email"
    if (!phone.trim()) newErrors.phone = "Phone number is required"
    if (!password) newErrors.password = "Password is required"
    if (password.length < 8) newErrors.password = "Password must be at least 8 characters"
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleFinalSubmit = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // In a real app, this would create the company and admin account
    // For now, redirect to login
    router.push("/login?registered=true")
  }

  return (
    <div className="min-h-screen bg-sidebar flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center w-12 h-12 rounded-lg bg-primary">
            <Zap className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>
            {step === 1
              ? "Start managing your field service business in minutes"
              : "Choose the plan that fits your business"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {step > 1 ? <Check className="h-4 w-4" /> : "1"}
            </div>
            <div className={`w-16 h-1 rounded ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              2
            </div>
          </div>

          {step === 1 ? (
            <form onSubmit={handleStep1Submit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="companyName">Company Name</FieldLabel>
                  <Input
                    id="companyName"
                    placeholder="Acme HVAC Services"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                  {errors.companyName && (
                    <p className="text-sm text-destructive mt-1">{errors.companyName}</p>
                  )}
                </Field>
                
                <Field>
                  <FieldLabel htmlFor="adminName">Your Name</FieldLabel>
                  <Input
                    id="adminName"
                    placeholder="John Smith"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                  />
                  {errors.adminName && (
                    <p className="text-sm text-destructive mt-1">{errors.adminName}</p>
                  )}
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email}</p>
                    )}
                  </Field>
                  
                  <Field>
                    <FieldLabel htmlFor="phone">Phone</FieldLabel>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                    )}
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive mt-1">{errors.password}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
                  )}
                </Field>

                <Button type="submit" className="w-full">
                  Continue to Plan Selection
                </Button>
              </FieldGroup>
            </form>
          ) : (
            <div className="space-y-6">
              <RadioGroup
                value={selectedPlan}
                onValueChange={(value) => setSelectedPlan(value as SubscriptionPlan)}
              >
                <div className="grid gap-4">
                  {plans.map((plan) => (
                    <label
                      key={plan.id}
                      className={`flex cursor-pointer rounded-lg border p-4 transition-colors ${
                        selectedPlan === plan.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <RadioGroupItem value={plan.id} className="sr-only" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{plan.name}</h3>
                          <span className="text-lg font-bold">
                            ${plan.price}
                            <span className="text-sm font-normal text-muted-foreground">/mo</span>
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {plan.features.map((feature) => (
                            <li
                              key={feature}
                              className="text-sm text-muted-foreground flex items-center gap-2"
                            >
                              <Check className="h-3 w-3 text-primary" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </label>
                  ))}
                </div>
              </RadioGroup>

              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">14-day free trial</strong> - No credit card required. 
                  You can upgrade or cancel anytime.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleFinalSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Start Free Trial"}
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-sidebar-muted text-center max-w-md">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}
