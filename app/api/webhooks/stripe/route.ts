import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Stripe from "stripe"
import { headers } from "next/headers"

// Lazy initialization of Stripe - only create when needed
let stripeInstance: Stripe | null = null
function getStripe(): Stripe | null {
  if (!stripeInstance && process.env.STRIPE_SECRET_KEY) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
    })
  }
  return stripeInstance
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

// POST /api/webhooks/stripe - Handle Stripe webhooks
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }
    
    const payload = await request.text()
    const headersList = await headers()
    const signature = headersList.get("stripe-signature")

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid signature'
      console.error("[Stripe Webhook] Invalid signature:", errorMessage)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Update subscription in database
        const companyId = session.metadata?.company_id
        const planId = session.metadata?.plan_id

        if (companyId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          const currentPeriodStart = subscription.current_period_start 
            ? new Date(subscription.current_period_start * 1000) 
            : null
          const currentPeriodEnd = subscription.current_period_end 
            ? new Date(subscription.current_period_end * 1000) 
            : null
          const trialStart = subscription.trial_start 
            ? new Date(subscription.trial_start * 1000) 
            : null
          const trialEnd = subscription.trial_end 
            ? new Date(subscription.trial_end * 1000) 
            : null

          await supabase.from("subscriptions").upsert({
            company_id: companyId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0]?.price.id,
            status: subscription.status,
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd,
            trial_start: trialStart,
            trial_end: trialEnd,
            plan_name: planId,
          }, {
            onConflict: "company_id"
          })

          // Update company subscription status
          await supabase
            .from("companies")
            .update({
              subscription_status: subscription.status,
              plan_id: planId,
              stripe_customer_id: session.customer as string,
              trial_ends_at: subscription.trial_end 
                ? new Date(subscription.trial_end * 1000) 
                : null,
            })
            .eq("id", companyId)
        }
        break
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice
        
        // Record payment
        if (invoice.customer && invoice.amount_due > 0 && supabase) {
          const { data: subscriptionData } = await supabase
            .from("subscriptions")
            .select("company_id")
            .eq("stripe_customer_id", invoice.customer as string)
            .single()

          if (subscriptionData) {
            await supabase.from("payments").insert({
              company_id: subscriptionData.company_id,
              stripe_invoice_id: invoice.id,
              stripe_payment_intent_id: invoice.payment_intent as string,
              amount: invoice.amount_due,
              currency: invoice.currency,
              status: "succeeded",
              billing_reason: invoice.billing_reason,
              description: invoice.description,
              paid_at: new Date(),
            })
          }
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        
        // Update subscription status
        if (supabase) {
          await supabase
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_customer_id", invoice.customer as string)
        }

        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        
        if (supabase) {
          // Update subscription status
          await supabase
            .from("subscriptions")
            .update({
              status: subscription.status,
              current_period_start: subscription.current_period_start 
                ? new Date(subscription.current_period_start * 1000) 
                : null,
              current_period_end: subscription.current_period_end 
                ? new Date(subscription.current_period_end * 1000) 
                : null,
              cancel_at_period_end: subscription.cancel_at_period_end,
            })
            .eq("stripe_subscription_id", subscription.id)

          // Update company status
          await supabase
            .from("companies")
            .update({ subscription_status: subscription.status })
            .eq("stripe_customer_id", subscription.customer as string)
        }

        break
      }

      case "customer.subscription.deleted": {
        const subscription: any = event.data.object as Stripe.Subscription
        
        if (supabase) {
          // Mark subscription as canceled
          await supabase
            .from("subscriptions")
            .update({ 
              status: "canceled",
              canceled_at: new Date(),
            })
            .eq("stripe_subscription_id", subscription.id)

          // Update company status
          await supabase
            .from("companies")
            .update({ subscription_status: "canceled" })
            .eq("stripe_customer_id", subscription.customer as string)
        }

        break
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("[Stripe Webhook] Error:", error)
    return NextResponse.json(
      { error: error.message || "Webhook handler failed" },
      { status: 500 }
    )
  }
}
