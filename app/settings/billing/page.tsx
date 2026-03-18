"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Loader2, 
  CreditCard, 
  Calendar, 
  AlertCircle, 
  CheckCircle2,
  ExternalLink,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

interface SubscriptionData {
  company: {
    id: string
    name: string
    status: string
    planId: string
    trialEndsAt: string | null
    trialDaysRemaining: number
    isTrialing: boolean
    isActive: boolean
  }
  subscription: {
    status: string
    current_period_end: string
    cancel_at_period_end: boolean
  } | null
  plan: {
    id: string
    name: string
    amount: number
    description: string
  } | null
}

export default function BillingSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/billing/subscription")
      if (!response.ok) throw new Error("Failed to fetch subscription")
      const data = await response.json()
      setData(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openBillingPortal = async () => {
    setActionLoading("portal")
    try {
      const response = await fetch("/api/billing/portal", { method: "POST" })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No portal URL returned")
      }
    } catch (err: any) {
      alert("Failed to open billing portal: " + err.message)
      setActionLoading(null)
    }
  }

  const cancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll continue to have access until the end of your billing period.")) {
      return
    }
    
    setActionLoading("cancel")
    try {
      const response = await fetch("/api/billing/subscription", { 
        method: "DELETE" 
      })
      if (response.ok) {
        alert("Your subscription will be canceled at the end of the billing period.")
        await fetchSubscription()
      } else {
        throw new Error("Failed to cancel subscription")
      }
    } catch (err: any) {
      alert("Failed to cancel: " + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!data) return null

  const { company, subscription, plan } = data

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-slate-600">Manage your subscription and payment methods</p>
      </div>

      {/* Current Plan Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your subscription details</CardDescription>
            </div>
            <Badge 
              variant={company.isActive ? "default" : "destructive"}
              className={company.status === "trialing" ? "bg-blue-500" : ""}
            >
              {company.status === "trialing" ? "Free Trial" : company.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold">{plan?.name || "Starter"}</span>
            {plan && (
              <span className="text-slate-500">${plan.amount / 100}/month</span>
            )}
          </div>

          {company.isTrialing && (
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <Calendar className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>{company.trialDaysRemaining} days remaining</strong> in your free trial.
                <br />
                Your trial ends on {company.trialEndsAt ? new Date(company.trialEndsAt).toLocaleDateString() : "N/A"}
              </AlertDescription>
            </Alert>
          )}

          {subscription?.cancel_at_period_end && (
            <Alert className="mb-4 bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Your subscription will be canceled at the end of the billing period.
                <br />
                You will continue to have access until {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : "N/A"}
              </AlertDescription>
            </Alert>
          )}

          {subscription && !company.isTrialing && (
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Next billing date: {new Date(subscription.current_period_end).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Manage Subscription</CardTitle>
          <CardDescription>Update your plan or payment method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {company.isTrialing ? (
            <>
              <p className="text-slate-600">
                Your free trial ends in {company.trialDaysRemaining} days. 
                Subscribe now to continue using Dispatchly without interruption.
              </p>
              <Link href="/pricing">
                <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                  Choose a Plan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={openBillingPortal}
                disabled={!!actionLoading}
              >
                {actionLoading === "portal" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                Manage Payment Method
              </Button>

              <Link href="/pricing">
                <Button variant="outline">
                  Change Plan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              {!subscription?.cancel_at_period_end && (
                <Button 
                  variant="destructive" 
                  onClick={cancelSubscription}
                  disabled={!!actionLoading}
                >
                  {actionLoading === "cancel" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Cancel Subscription
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Your recent invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-sm">
            Payment history is managed through Stripe. 
            <button 
              onClick={openBillingPortal}
              className="text-blue-600 hover:underline ml-1"
            >
              View in Billing Portal
              <ExternalLink className="inline w-3 h-3 ml-1" />
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
