"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Check, 
  Loader2, 
  Zap,
  Users,
  Mail,
  ArrowRight,
  Sparkles,
  Building2,
  MessageSquare,
  Camera,
  BarChart3,
  Shield,
  Clock
} from "lucide-react"
import { useStore } from "@/lib/store"

const features = [
  "Up to 5 technicians",
  "Unlimited jobs",
  "Unlimited SMS messaging",
  "Photo uploads & storage",
  "Real-time status tracking",
  "Customer notifications",
  "Basic reporting & analytics",
  "Email support",
  "Magic link authentication",
  "Mobile-friendly dashboard",
]

const faqs = [
  {
    question: "What happens after the 14-day trial?",
    answer: "After your trial ends, you'll be prompted to enter payment details to continue using Dispatchly. If you choose not to continue, your account will be paused but your data will be saved for 30 days."
  },
  {
    question: "Can I add more than 5 technicians?",
    answer: "Our standard plan includes up to 5 technicians. If you need more, please contact us for a custom enterprise plan tailored to your business needs."
  },
  {
    question: "Is there a contract or commitment?",
    answer: "No long-term contracts. Dispatchly is month-to-month. You can cancel anytime and your subscription will remain active until the end of your current billing period."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express) through our secure Stripe integration."
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with Dispatchly within your first 30 days, contact us for a full refund."
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
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

  const handleSubscribe = async () => {
    if (!user) {
      window.location.href = "/signup"
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/billing/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          priceId: "price_starter", 
          planId: "starter" 
        }),
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
      setLoading(false)
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
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              One Plan, Everything
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              You Need
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free for 14 days. No credit card required. Simple $39/month for up to 5 technicians.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Main Pricing Card */}
            <Card className="relative border-primary shadow-xl shadow-primary/10 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary" />
              
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Starter Plan</h3>
                    <p className="text-sm text-muted-foreground">Perfect for small HVAC businesses</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-bold">$39</span>
                    <span className="text-xl text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Billed monthly. Cancel anytime.
                  </p>
                </div>

                <div className="flex items-center gap-2 mb-6 p-3 bg-primary/5 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium">Up to 5 technicians included</span>
                </div>

                <Button
                  onClick={handleSubscribe}
                  disabled={loading || currentPlan === "starter"}
                  className="w-full h-12 text-base shadow-lg shadow-primary/25 mb-6"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : currentPlan === "starter" ? (
                    "Current Plan"
                  ) : (
                    <>
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  14-day free trial • No credit card required
                </p>
              </CardContent>
            </Card>

            {/* Features List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Everything included:</h3>
              <div className="grid gap-3">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30 border-y">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Enterprise</Badge>
            <h2 className="text-3xl font-bold mb-4">Need More Than 5 Technicians?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We offer custom enterprise plans for larger operations. 
              Get dedicated support, advanced features, and unlimited technicians.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-border/50">
              <CardContent className="p-6 text-center">
                <Building2 className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Unlimited Techs</h3>
                <p className="text-sm text-muted-foreground">Scale to any team size</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Dedicated Support</h3>
                <p className="text-sm text-muted-foreground">Priority help when you need it</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Custom Reporting</h3>
                <p className="text-sm text-muted-foreground">Advanced analytics & insights</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link href="mailto:enterprise@dispatchly.co">
              <Button size="lg" variant="outline" className="border-2">
                <Mail className="mr-2 h-4 w-4" />
                Contact Sales
              </Button>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Or email us at{" "}
              <a href="mailto:enterprise@dispatchly.co" className="text-primary hover:underline">
                enterprise@dispatchly.co
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
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
                    <Mail className="mr-2 h-4 w-4" />
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
          <div className="flex gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
