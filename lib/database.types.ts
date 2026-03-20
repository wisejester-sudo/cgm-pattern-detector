export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type JobStatus = 'available' | 'scheduled' | 'en_route' | 'working' | 'on_hold' | 'complete'

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          created_at: string
          name: string
          phone: string | null
          admin_id: string
          trade_type: string
          custom_job_types: string[]
          default_sms_template_id: string | null
          logo_url: string | null
          primary_color: string
          tagline: string | null
          business_hours: string | null
          service_area: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          phone?: string | null
          admin_id: string
          trade_type?: string
          custom_job_types?: string[]
          default_sms_template_id?: string | null
          logo_url?: string | null
          primary_color?: string
          tagline?: string | null
          business_hours?: string | null
          service_area?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          phone?: string | null
          admin_id?: string
          trade_type?: string
          custom_job_types?: string[]
          default_sms_template_id?: string | null
          logo_url?: string | null
          primary_color?: string
          tagline?: string | null
          business_hours?: string | null
          service_area?: string | null
        }
      }
      technicians: {
        Row: {
          id: string
          created_at: string
          company_id: string | null
          admin_id: string
          name: string
          phone: string
          email: string | null
          pin: string | null
          magic_link_token: string | null
          magic_link_expires_at: string | null
          invited_at: string | null
          invited_by: string | null
          accessed_at: string | null
          last_active_at: string | null
          last_login: string | null
          is_active: boolean
          role: string
          assigned_jobs: string[]
          environment: string | null
          base_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          company_id?: string | null
          admin_id: string
          name: string
          phone: string
          email?: string | null
          pin?: string | null
          magic_link_token?: string | null
          magic_link_expires_at?: string | null
          invited_at?: string | null
          invited_by?: string | null
          accessed_at?: string | null
          last_active_at?: string | null
          last_login?: string | null
          is_active?: boolean
          role?: string
          assigned_jobs?: string[]
          environment?: string | null
          base_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          company_id?: string | null
          admin_id?: string
          name?: string
          phone?: string
          email?: string | null
          pin?: string | null
          magic_link_token?: string | null
          magic_link_expires_at?: string | null
          invited_at?: string | null
          invited_by?: string | null
          accessed_at?: string | null
          last_active_at?: string | null
          last_login?: string | null
          is_active?: boolean
          role?: string
          assigned_jobs?: string[]
          environment?: string | null
          base_url?: string | null
        }
      }
      jobs: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          company_id: string | null
          admin_id: string
          customer_name: string
          customer_phone: string
          customer_address: string
          job_type: string
          status: JobStatus
          notes: string | null
          assigned_tech_ids: string[] | null
          on_hold_reason: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          company_id?: string | null
          admin_id: string
          customer_name: string
          customer_phone: string
          customer_address: string
          job_type: string
          status?: JobStatus
          notes?: string | null
          assigned_tech_ids?: string[] | null
          on_hold_reason?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          company_id?: string | null
          admin_id?: string
          customer_name?: string
          customer_phone?: string
          customer_address?: string
          job_type?: string
          status?: JobStatus
          notes?: string | null
          assigned_tech_ids?: string[] | null
          on_hold_reason?: string | null
        }
      }
      updates: {
        Row: {
          id: string
          created_at: string
          job_id: string
          status: JobStatus
          notes: string | null
          sms_sent_at: string | null
          sms_delivered: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          job_id: string
          status: JobStatus
          notes?: string | null
          sms_sent_at?: string | null
          sms_delivered?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          job_id?: string
          status?: JobStatus
          notes?: string | null
          sms_sent_at?: string | null
          sms_delivered?: boolean
        }
      }
      photos: {
        Row: {
          id: string
          created_at: string
          update_id: string | null
          job_id: string
          url: string
          photo_url: string
          thumbnail_url: string | null
          size_bytes: number | null
          caption: string | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          update_id?: string | null
          job_id: string
          url: string
          photo_url: string
          thumbnail_url?: string | null
          size_bytes?: number | null
          caption?: string | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          update_id?: string | null
          job_id?: string
          url?: string
          photo_url?: string
          thumbnail_url?: string | null
          size_bytes?: number | null
          caption?: string | null
          uploaded_at?: string
        }
      }
      sms_logs: {
        Row: {
          id: string
          created_at: string
          job_id: string | null
          technician_id: string | null
          direction: 'inbound' | 'outbound'
          body: string
          from_number: string
          to_number: string
          twilio_sid: string | null
          parsed_keyword: string | null
          parsed_result: string | null
          message_type: 'general' | 'status_update' | 'status_notification' | 'note' | 'approval'
        }
        Insert: {
          id?: string
          created_at?: string
          job_id?: string | null
          technician_id?: string | null
          direction: 'inbound' | 'outbound'
          body: string
          from_number: string
          to_number: string
          twilio_sid?: string | null
          parsed_keyword?: string | null
          parsed_result?: string | null
          message_type?: 'general' | 'status_update' | 'status_notification' | 'note' | 'approval'
        }
        Update: {
          id?: string
          created_at?: string
          job_id?: string | null
          technician_id?: string | null
          direction?: 'inbound' | 'outbound'
          body?: string
          from_number?: string
          to_number?: string
          twilio_sid?: string | null
          parsed_keyword?: string | null
          parsed_result?: string | null
          message_type?: 'general' | 'status_update' | 'status_notification' | 'note' | 'approval'
        }
      }
      company_settings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          admin_id: string
          company_name: string
          company_phone: string | null
          trade_type: string
          custom_job_types: string[]
          default_sms_template_id: string | null
          logo_url: string | null
          primary_color: string
          tagline: string | null
          business_hours: string | null
          service_area: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          admin_id: string
          company_name: string
          company_phone?: string | null
          trade_type?: string
          custom_job_types?: string[]
          default_sms_template_id?: string | null
          logo_url?: string | null
          primary_color?: string
          tagline?: string | null
          business_hours?: string | null
          service_area?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          admin_id?: string
          company_name?: string
          company_phone?: string | null
          trade_type?: string
          custom_job_types?: string[]
          default_sms_template_id?: string | null
          logo_url?: string | null
          primary_color?: string
          tagline?: string | null
          business_hours?: string | null
          service_area?: string | null
        }
      }
      sms_templates: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          admin_id: string
          name: string
          template_body: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          admin_id: string
          name: string
          template_body: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          admin_id?: string
          name?: string
          template_body?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          created_at: string
          admin_id: string
          plan: string
          status: string
          current_period_start: string
          current_period_end: string
          sms_used_this_month: number
          sms_limit: number
        }
        Insert: {
          id?: string
          created_at?: string
          admin_id: string
          plan?: string
          status?: string
          current_period_start?: string
          current_period_end?: string
          sms_used_this_month?: number
          sms_limit?: number
        }
        Update: {
          id?: string
          created_at?: string
          admin_id?: string
          plan?: string
          status?: string
          current_period_start?: string
          current_period_end?: string
          sms_used_this_month?: number
          sms_limit?: number
        }
      }
      invoices: {
        Row: {
          id: string
          created_at: string
          admin_id: string
          amount: number
          status: string
          description: string | null
          stripe_invoice_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          admin_id: string
          amount: number
          status?: string
          description?: string | null
          stripe_invoice_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          admin_id?: string
          amount?: number
          status?: string
          description?: string | null
          stripe_invoice_id?: string | null
        }
      }
      public_job_tokens: {
        Row: {
          id: string
          created_at: string
          token: string
          job_id: string
          expires_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          token: string
          job_id: string
          expires_at: string
        }
        Update: {
          id?: string
          created_at?: string
          token?: string
          job_id?: string
          expires_at?: string
        }
      }
      magic_tokens: {
        Row: {
          id: string
          created_at: string
          token: string
          technician_id: string
          expires_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          token: string
          technician_id: string
          expires_at: string
        }
        Update: {
          id?: string
          created_at?: string
          token?: string
          technician_id?: string
          expires_at?: string
        }
      }
    }
  }
}
