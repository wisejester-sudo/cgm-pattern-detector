import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Routes that don't require active subscription
const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/pricing",
  "/tech",
  "/auth",
  "/t/",
  "/j/",
  "/track/",
  "/api/public",
  "/api/sms/webhook",
  "/api/auth",
  "/api/billing",
  "/api/webhooks",
]

// Routes that require active subscription (not just trial)
const paidRoutes = [
  "/jobs",
  "/technicians",
  "/settings",
  "/profile",
  "/reports",
]

export async function checkSubscription(request: NextRequest) {
  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isPublicRoute) {
    return null // Allow access
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return null // Let auth middleware handle this
    }

    // Get company subscription status
    const { data: company } = await supabase
      .from("companies")
      .select("subscription_status, trial_ends_at")
      .eq("user_id", user.id)
      .single()

    if (!company) {
      return null
    }

    // Check if subscription has expired
    if (company.subscription_status === "expired") {
      return NextResponse.redirect(new URL("/pricing", request.url))
    }

    // Check if trial has ended
    if (company.subscription_status === "trialing" && company.trial_ends_at) {
      const trialEnd = new Date(company.trial_ends_at)
      if (trialEnd < new Date()) {
        // Update company status
        await supabase
          .from("companies")
          .update({ subscription_status: "expired" })
          .eq("user_id", user.id)
        
        return NextResponse.redirect(new URL("/pricing", request.url))
      }
    }

    return null // Allow access
  } catch (error) {
    console.error("[Subscription Middleware] Error:", error)
    return null
  }
}
