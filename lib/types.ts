export type JobStatus = 'available' | 'scheduled' | 'en_route' | 'working' | 'on_hold' | 'complete'

export type UserRole = 'admin' | 'technician'

export type SubscriptionPlan = 'free' | 'starter' | 'pro'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  is_active: boolean
  created_at: string
  last_login: string | null
  avatar_url?: string | null
}

export interface Admin extends User {
  role: 'admin'
  password_hash?: string // In real app, handled by backend
}

export interface Technician extends User {
  role: 'technician'
  pin: string
  assigned_jobs: string[]
  magic_link_token?: string | null
  token_expires_at?: string | null
  invited_at?: string | null
  invited_by?: string | null
  accessed_at?: string | null
  last_active_at?: string | null
}

export interface Job {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  job_type: string
  status: JobStatus
  scheduled_time: string
  notes: string | null
  assigned_tech_ids: string[] | null  // Changed from assigned_tech_id (string) to support multiple techs
  on_hold_reason: string | null      // Reason why job is on hold
  created_at: string
  updated_at: string
}

export interface JobPhoto {
  id: string
  job_id: string
  photo_url: string
  caption: string | null
  uploaded_at: string
}

export interface SmsLog {
  id: string
  job_id: string
  recipient_phone: string
  message_body: string
  sent_at: string
  status: 'sent' | 'failed' | 'pending' | 'delivered' | 'received'
  message_sid?: string | null
  // Enhanced conversation fields
  sender_name?: string
  sender_type?: 'admin' | 'technician' | 'system' | 'customer'
  sender_id?: string
  direction: 'inbound' | 'outbound'
  is_read?: boolean
  twilio_status?: string
  parent_message_id?: string | null
}

export interface SmsTemplate {
  id: string
  name: string
  template_body: string
  created_at: string
  updated_at: string
}

export interface CompanySettings {
  id: string
  company_name: string
  company_phone: string
  trade_type: string  // 'hvac' | 'plumbing' | 'electrical' | 'landscaping' | 'generic'
  custom_job_types: string[]
  default_sms_template_id: string | null
  updated_at: string
  // Branding
  logo_url?: string | null
  primary_color?: string
  tagline?: string | null
  business_hours?: string | null
  service_area?: string | null
}

export interface Subscription {
  id: string
  plan: SubscriptionPlan
  status: 'active' | 'cancelled' | 'past_due'
  current_period_start: string
  current_period_end: string
  sms_used_this_month: number
  sms_limit: number
}

export interface Invoice {
  id: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  created_at: string
  description: string
}

export interface NotificationPreferences {
  email_new_job: boolean
  email_status_updates: boolean
  email_customer_replies: boolean
  email_daily_summary: boolean
  sms_enabled: boolean
  quiet_hours_start: string | null // e.g., "22:00"
  quiet_hours_end: string | null // e.g., "07:00"
}

export interface JobUpdate {
  id: string
  job_id: string
  status: JobStatus
  notes: string | null
  photos: string[] // Array of photo URLs
  created_at: string
  created_by_tech_id: string | null
}

export interface MagicToken {
  id: string
  token: string
  technician_id: string
  expires_at: string
  created_at: string
}

export interface PublicJobToken {
  id: string
  token: string
  job_id: string
  expires_at: string
  created_at: string
}

// API update interfaces
export interface ProfileUpdateData {
  full_name?: string
  phone?: string
  email?: string
}

export interface UserProfileInsertData {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: 'admin'
  company_name: string | null
  created_at: string
}

// Database row types for Supabase
export interface DatabaseJobUpdate {
  job_id: string
  status: JobStatus
  notes?: string | null
  photos?: string[]
  created_by_tech_id?: string | null
  created_at?: string
}

// SMS webhook types
export interface IncomingSMSParams {
  From: string
  Body: string
  MessageSid: string
  NumMedia?: string
}

export interface SMSLogEntry {
  job_id: string | null
  technician_id: string | null
  from_number: string
  to_number: string
  body: string
  twilio_sid: string | null
  direction: 'inbound' | 'outbound'
  parsed_keyword: string | null
  parsed_result: string
  message_type: string
}
