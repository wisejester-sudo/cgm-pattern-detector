"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Check, 
  Loader2, 
  Zap,
  Users,
  MessageSquare,
  BarChart3,
  Shield
} from "lucide-react"
import { useStore } from "@/lib/store"

const plans = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for small HVAC businesses just getting started",
    price: 39,
    priceId: "price_starter", // Replace with actual Stripe price ID
    features: [
      "Up to 3 technicians",
      "Unlimited jobs",
      "SMS messaging",
      "Photo uploads",
      "Basic reporting",
      "Email support",
    ],
    icon: Zap,
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing businesses with multiple technicians",
    price: 79,
    priceId: "price_pro", // Replace with actual Stripe price ID
    features: [
      "Up to 10 technicians",
      "Unlimited jobs",
      "SMS messaging",
      "Photo uploads",
      "Advanced reporting",
      "Priority support",
      "Custom templates",
    ],
    icon: Users,
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large operations with custom needs",
    price: 199,
    priceId: "price_enterprise", // Replace with actual Stripe price ID
    features: [
      "Unlimited technicians",
      "Unlimited jobs",
      "SMS messaging",
      "Photo uploads",
      "Custom reporting",
      "Dedicated support",
      "API access",
      "Custom integrations",
    ],
    icon: Shield,
    popular: false,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const { user } = useStore()

  useEffect(() => {
    // Fetch current subscription
    if (user) {
      fetch("/api/billing/subscription")
        .then((res) => res.json())
        .then((data) => {
          if (data.company?.planId) {
            setCurrentPlan(data.company.planId)
          }
        })
        .catch(console.error)
    }
  }, [user])

  const handleSubscribe = async (planId: string, priceId: string) => {
    if (!user) {
      window.location.href = "/signup"
      return
    }

    setLoading(planId)

    try {
      const response = await fetch("/api/billing/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, planId }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (error) {
      console.error("[Pricing] Checkout error:", error)
      alert("Failed to start checkout. Please try again.")
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Dispatchly</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Start with a 14-day free trial. No credit card required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular
                  ? "border-blue-500 shadow-lg shadow-blue-100"
                  : "border-slate-200"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500">
                  Most Popular
                </Badge>
              )}
              
              {currentPlan === plan.id && (
                <Badge className="absolute -top-3 right-4 bg-green-500">
                  Current Plan
                </Badge>
              )}

              <CardHeader>
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                  <plan.icon className="w-6 h-6 text-slate-600" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-slate-500">/month</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-slate-900 hover:bg-slate-800"
                  }`}
                  disabled={loading === plan.id || currentPlan === plan.id}
                  onClick={() => handleSubscribe(plan.id, plan.priceId)}
                >
                  {loading === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : currentPlan === plan.id ? (
                    "Current Plan"
                  ) : (
                    "Start Free Trial"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trial Info */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">
              14-day free trial • No credit card required • Cancel anytime
            </span>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border">
              <h3 className="font-semibold text-slate-900 mb-2">
                What happens after the 14-day trial?
              </h3>
              <p className="text-slate-600">
                After your trial ends, you'll be automatically subscribed to the plan you selected. 
                You can cancel anytime before the trial ends and you won't be charged.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border">
              <h3 className="font-semibold text-slate-900 mb-2">
                Can I change plans later?
              </h3>
              <p className="text-slate-600">
                Yes! You can upgrade or downgrade your plan at any time from your billing settings. 
                Changes take effect at your next billing cycle.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border">
              <h3 className="font-semibold text-slate-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-slate-600">
                We accept all major credit cards (Visa, MasterCard, American Express) through Stripe. 
                Enterprise plans can also pay by invoice.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border">
              <h3 className="font-semibold text-slate-900 mb-2">
                Do I need to enter a credit card for the free trial?
              </h3>
              <p className="text-slate-600">
                No credit card is required to start your free trial. You'll only need to enter 
                payment information when you choose to continue after the trial period.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Dispatchly</span>
            </div>
            <p className="text-sm text-slate-400">
              © 2026 Dispatchly. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
