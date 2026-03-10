export type JobStatus = 'scheduled' | 'en_route' | 'working' | 'complete'

export interface Job {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  job_type: string
  status: JobStatus
  scheduled_time: string
  notes: string | null
  assigned_tech_id: string | null
  created_at: string
  updated_at: string
}

export interface Technician {
  id: string
  name: string
  email: string
  phone: string
  pin: string
  is_active: boolean
  created_at: string
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
  status: 'sent' | 'failed' | 'pending'
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
  default_sms_template_id: string | null
  updated_at: string
}
