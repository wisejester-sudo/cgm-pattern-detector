"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  Check, 
  Loader2, 
  Zap,
  Users,
  Shield,
  ArrowRight,
  Sparkles
} from "lucide-react"
import { useStore } from "@/lib/store"

const plans = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for small HVAC businesses just getting started",
    monthlyPrice: 39,
    yearlyPrice: 390,
    priceId: "price_starter",
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
    monthlyPrice: 79,
    yearlyPrice: 790,
    priceId: "price_pro",
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
    monthlyPrice: 199,
    yearlyPrice: 1990,
    priceId: "price_enterprise",
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

const faqs = [
  {
    question: "Can I change plans later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
  },
  {
    question: "What happens after the 14-day trial?",
    answer: "After your trial ends, you'll be prompted to enter payment details to continue using Dispatchly."
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 30-day money-back guarantee if you're not satisfied with Dispatchly."
  },
  {
    question: "Can I add more technicians later?",
    answer: "Absolutely! You can upgrade to a higher plan anytime to add more technicians."
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [isYearly, setIsYearly] = useState(false)
  const { currentAdmin: user } = useStore()

  useEffect(() => {
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
        throw new Error(data.error || "Failed to create checkout")
      }
    } catch (error) {
      console.error("Subscribe error:", error)
      alert("Failed to start checkout. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg shadow-primary/25">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Dispatchly
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Simple Pricing
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              Choose Your Plan
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Start free for 14 days. No credit card required. Upgrade or downgrade anytime.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm ${!isYearly ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={`text-sm ${isYearly ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              Yearly
            </span>
            {isYearly && (
              <Badge variant="secondary" className="ml-2 text-xs">
                Save 17%
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon
              const isCurrentPlan = currentPlan === plan.id
              const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice

              return (
                <Card 
                  key={plan.id}
                  className={`relative flex flex-col ${
                    plan.popular 
                      ? "border-primary shadow-xl shadow-primary/10 scale-105 z-10" 
                      : "border-border/50 shadow-sm"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground shadow-lg">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="mb-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                        plan.popular ? "bg-primary/10" : "bg-muted"
                      }`}>
                        <Icon className={`w-6 h-6 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">${price}</span>
                        <span className="text-muted-foreground">/{isYearly ? "year" : "month"}</span>
                      </div>
                      {isYearly && (
                        <p className="text-sm text-muted-foreground mt-1">
                          ${Math.round(plan.yearlyPrice / 12)}/mo billed annually
                        </p>
                      )}
                    </div>

                    <ul className="space-y-3 mb-6 flex-grow">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                            plan.popular ? "text-primary" : "text-green-500"
                          }`} />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleSubscribe(plan.id, plan.priceId)}
                      disabled={loading === plan.id || isCurrentPlan}
                      variant={plan.popular ? "default" : "outline"}
                      className="w-full"
                    >
                      {loading === plan.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : isCurrentPlan ? (
                        "Current Plan"
                      ) : (
                        <>Get Started <ArrowRight className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30 border-y">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-12 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:20px_20px]" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-primary-foreground mb-4">
                Still have questions?
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Our team is here to help. Reach out and we'll get back to you within 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="mailto:support@dispatchly.co">
                  <Button size="lg" variant="secondary">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold">Dispatchly</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Dispatchly. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
