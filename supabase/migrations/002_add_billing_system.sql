-- Billing System Migration
-- Stripe subscription management with 14-day free trial

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  stripe_price_id text,
  status text NOT NULL CHECK (status IN ('trialing', 'active', 'canceled', 'incomplete', 'past_due', 'unpaid')) DEFAULT 'trialing',
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  trial_start timestamp with time zone,
  trial_end timestamp with time zone,
  cancel_at_period_end boolean DEFAULT false,
  canceled_at timestamp with time zone,
  plan_name text NOT NULL DEFAULT 'starter'
);

-- Payments/invoices table
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  stripe_invoice_id text UNIQUE,
  stripe_payment_intent_id text,
  amount integer NOT NULL, -- in cents
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
  billing_reason text,
  description text,
  invoice_url text,
  receipt_url text,
  paid_at timestamp with time zone
);

-- Pricing plans reference table
CREATE TABLE IF NOT EXISTS public.plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  stripe_price_id text UNIQUE,
  amount integer NOT NULL, -- monthly amount in cents
  currency text DEFAULT 'usd',
  interval text NOT NULL DEFAULT 'month',
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true
);

-- Insert default plans
INSERT INTO public.plans (id, name, description, amount, features) VALUES
('starter', 'Starter', 'Perfect for small HVAC businesses just getting started', 3900, '["Up to 3 technicians", "Unlimited jobs", "SMS messaging", "Photo uploads", "Basic reporting"]'),
('pro', 'Pro', 'For growing businesses with multiple technicians', 7900, '["Up to 10 technicians", "Unlimited jobs", "SMS messaging", "Photo uploads", "Advanced reporting", "Priority support"]'),
('enterprise', 'Enterprise', 'For large operations with custom needs', 19900, '["Unlimited technicians", "Unlimited jobs", "SMS messaging", "Photo uploads", "Custom reporting", "Dedicated support", "API access"]')
ON CONFLICT (id) DO NOTHING;

-- Add subscription status to companies for easy querying
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trialing',
ADD COLUMN IF NOT EXISTS trial_ends_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS plan_id text REFERENCES public.plans(id) DEFAULT 'starter';

-- Set default trial end for existing companies
UPDATE public.companies 
SET trial_ends_at = COALESCE(trial_ends_at, created_at + interval '14 days'),
    subscription_status = COALESCE(subscription_status, 'trialing')
WHERE trial_ends_at IS NULL;

-- Create function to update trial status
CREATE OR REPLACE FUNCTION public.check_trial_status()
RETURNS void AS $$
BEGIN
  -- Update companies where trial has expired
  UPDATE public.companies
  SET subscription_status = 'expired'
  WHERE subscription_status = 'trialing'
    AND trial_ends_at < NOW();
    
  -- Update subscriptions where trial has ended
  UPDATE public.subscriptions
  SET status = 'canceled'
  WHERE status = 'trialing'
    AND trial_end < NOW();
END;
$$ LANGUAGE plpgsql;

-- Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own company subscription" ON public.subscriptions
  FOR SELECT USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view own company payments" ON public.payments
  FOR SELECT USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_company ON public.subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_company ON public.payments(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_companies_trial_ends ON public.companies(trial_ends_at) 
  WHERE subscription_status = 'trialing';

-- Comments
COMMENT ON TABLE public.subscriptions IS 'Stripe subscription records with trial tracking';
COMMENT ON TABLE public.payments IS 'Payment history and invoice records';
COMMENT ON TABLE public.plans IS 'Available pricing plans with Stripe price IDs';
