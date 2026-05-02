import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

// GET /api/billing/subscription - Get current subscription status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get company with subscription info
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select(`
        id,
        name,
        subscription_status,
        trial_ends_at,
        plan_id,
        stripe_customer_id
      `)
      .eq("user_id", user.id)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Get detailed subscription info if exists
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("company_id", company.id)
      .single()

    // Get plan details
    const { data: plan } = await supabase
      .from("plans")
      .select("*")
      .eq("id", company.plan_id || "starter")
      .single()

    // Calculate days remaining in trial
    let trialDaysRemaining = null
    if (company.subscription_status === "trialing" && company.trial_ends_at) {
      const trialEnd = new Date(company.trial_ends_at)
      const now = new Date()
      const diffTime = trialEnd.getTime() - now.getTime()
      trialDaysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        status: company.subscription_status || "trialing",
        planId: company.plan_id || "starter",
        trialEndsAt: company.trial_ends_at,
        trialDaysRemaining: trialDaysRemaining && trialDaysRemaining > 0 ? trialDaysRemaining : 0,
        isTrialing: company.subscription_status === "trialing",
        isActive: ["trialing", "active"].includes(company.subscription_status || ""),
      },
      subscription: subscription || null,
      plan: plan || null,
    })
  } catch (error: any) {
    console.error("[Billing] Get subscription error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to get subscription" },
      { status: 500 }
    )
  }
}

// DELETE /api/billing/subscription - Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: company } = await supabase
      .from("companies")
      .select("id, stripe_customer_id")
      .eq("user_id", user.id)
      .single()

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Update subscription to cancel at period end
    const { data: subscription } = await supabase
      .from("subscriptions")
      .update({ cancel_at_period_end: true })
      .eq("company_id", company.id)
      .select()
      .single()

    return NextResponse.json({
      success: true,
      message: "Subscription will be canceled at the end of the billing period",
      subscription,
    })
  } catch (error: any) {
    console.error("[Billing] Cancel subscription error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to cancel subscription" },
      { status: 500 }
    )
  }
}
