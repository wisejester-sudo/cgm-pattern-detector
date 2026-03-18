export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          created_at: string
          name: string
          phone: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          phone?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          phone?: string | null
          user_id?: string
        }
      }
      technicians: {
        Row: {
          id: string
          created_at: string
          company_id: string
          name: string
          phone: string
          magic_link_token: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          company_id: string
          name: string
          phone: string
          magic_link_token?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          company_id?: string
          name?: string
          phone?: string
          magic_link_token?: string | null
        }
      }
      jobs: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          company_id: string
          technician_id: string | null
          customer_name: string
          customer_phone: string
          address: string
          job_type: string
          status: 'scheduled' | 'enroute' | 'working' | 'complete'
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          company_id: string
          technician_id?: string | null
          customer_name: string
          customer_phone: string
          address: string
          job_type: string
          status?: 'scheduled' | 'enroute' | 'working' | 'complete'
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          company_id?: string
          technician_id?: string | null
          customer_name?: string
          customer_phone?: string
          address?: string
          job_type?: string
          status?: 'scheduled' | 'enroute' | 'working' | 'complete'
          notes?: string | null
        }
      }
      updates: {
        Row: {
          id: string
          created_at: string
          job_id: string
          status: 'scheduled' | 'enroute' | 'working' | 'complete'
          notes: string | null
          sms_sent_at: string | null
          sms_delivered: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          job_id: string
          status: 'scheduled' | 'enroute' | 'working' | 'complete'
          notes?: string | null
          sms_sent_at?: string | null
          sms_delivered?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          job_id?: string
          status?: 'scheduled' | 'enroute' | 'working' | 'complete'
          notes?: string | null
          sms_sent_at?: string | null
          sms_delivered?: boolean
        }
      }
      photos: {
        Row: {
          id: string
          created_at: string
          update_id: string
          url: string
          thumbnail_url: string | null
          size_bytes: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          update_id: string
          url: string
          thumbnail_url?: string | null
          size_bytes?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          update_id?: string
          url?: string
          thumbnail_url?: string | null
          size_bytes?: number | null
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
          technician_id?: string | null
          parsed_keyword?: string | null
          parsed_result?: string | null
          message_type?: 'general' | 'status_update' | 'status_notification' | 'note' | 'approval'
          created_at?: string
          job_id?: string | null
          direction?: 'inbound' | 'outbound'
          body?: string
          from_number?: string
          to_number?: string
          twilio_sid?: string | null
        }
      }
    }
  }
}
