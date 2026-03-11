"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  Job, 
  Technician, 
  JobPhoto, 
  SmsLog, 
  SmsTemplate, 
  CompanySettings, 
  JobStatus,
  Admin,
  Subscription,
  Invoice,
  NotificationPreferences
} from './types'

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15)

// Initial Admin
const initialAdmin: Admin = {
  id: 'admin-1',
  name: 'HVAC Harry',
  email: 'harry@coolairhvac.com',
  phone: '(555) 999-0000',
  role: 'admin',
  is_active: true,
  created_at: new Date().toISOString(),
  last_login: new Date().toISOString(),
  avatar_url: null,
}

// Initial mock data
const initialJobs: Job[] = [
  {
    id: '1',
    customer_name: 'John Smith',
    customer_phone: '(555) 123-4567',
    customer_address: '123 Oak Street, Austin, TX 78701',
    job_type: 'AC Repair',
    status: 'scheduled',
    scheduled_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    notes: 'Customer reports AC not cooling properly',
    assigned_tech_id: 'tech-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    customer_name: 'Sarah Johnson',
    customer_phone: '(555) 234-5678',
    customer_address: '456 Maple Ave, Austin, TX 78702',
    job_type: 'Furnace Maintenance',
    status: 'en_route',
    scheduled_time: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    notes: 'Annual maintenance checkup',
    assigned_tech_id: 'tech-2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    customer_name: 'Mike Davis',
    customer_phone: '(555) 345-6789',
    customer_address: '789 Pine Rd, Austin, TX 78703',
    job_type: 'Duct Cleaning',
    status: 'working',
    scheduled_time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    notes: null,
    assigned_tech_id: 'tech-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    customer_name: 'Emily Wilson',
    customer_phone: '(555) 456-7890',
    customer_address: '321 Elm Blvd, Austin, TX 78704',
    job_type: 'AC Installation',
    status: 'complete',
    scheduled_time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    notes: 'New unit installed successfully',
    assigned_tech_id: 'tech-2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const initialTechnicians: Technician[] = [
  {
    id: 'tech-1',
    name: 'Bob Martinez',
    email: 'bob@coolairhvac.com',
    phone: '(555) 111-2222',
    role: 'technician',
    pin: '1234',
    is_active: true,
    created_at: new Date().toISOString(),
    last_login: null,
    assigned_jobs: ['1', '3'],
  },
  {
    id: 'tech-2',
    name: 'Alice Chen',
    email: 'alice@coolairhvac.com',
    phone: '(555) 333-4444',
    role: 'technician',
    pin: '5678',
    is_active: true,
    created_at: new Date().toISOString(),
    last_login: null,
    assigned_jobs: ['2', '4'],
  },
]

const initialTemplates: SmsTemplate[] = [
  {
    id: '1',
    name: 'En Route Notification',
    template_body: 'Hi {customer_name}, your technician {tech_name} is on the way to {address}. ETA: {eta}. Questions? Call {company_phone}.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Job Complete',
    template_body: 'Hi {customer_name}, your {job_type} service has been completed. Thank you for choosing {company_name}!',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const initialSettings: CompanySettings = {
  id: '1',
  company_name: 'CoolAir HVAC Services',
  company_phone: '(555) 999-0000',
  default_sms_template_id: '1',
  updated_at: new Date().toISOString(),
  logo_url: null,
  primary_color: '#3b82f6',
  tagline: 'Keeping You Cool Since 2010',
  business_hours: 'Mon-Fri 8AM-6PM, Sat 9AM-2PM',
  service_area: 'Austin Metro Area',
}

const initialSubscription: Subscription = {
  id: 'sub-1',
  plan: 'pro',
  status: 'active',
  current_period_start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
  sms_used_this_month: 127,
  sms_limit: 500,
}

const initialInvoices: Invoice[] = [
  {
    id: 'inv-1',
    amount: 79,
    status: 'paid',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Pro Plan - Monthly',
  },
  {
    id: 'inv-2',
    amount: 79,
    status: 'paid',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Pro Plan - Monthly',
  },
  {
    id: 'inv-3',
    amount: 79,
    status: 'paid',
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Pro Plan - Monthly',
  },
]

const initialNotificationPreferences: NotificationPreferences = {
  email_new_job: true,
  email_status_updates: true,
  email_customer_replies: true,
  email_daily_summary: false,
  sms_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '07:00',
}

interface AppState {
  // Core data
  jobs: Job[]
  technicians: Technician[]
  photos: JobPhoto[]
  smsLogs: SmsLog[]
  templates: SmsTemplate[]
  settings: CompanySettings
  
  // Auth state
  currentAdmin: Admin | null
  currentTechId: string | null
  isAdminAuthenticated: boolean
  
  // Subscription & billing
  subscription: Subscription
  invoices: Invoice[]
  notificationPreferences: NotificationPreferences
  
  // Role checks (computed)
  isAdmin: () => boolean
  isTechnician: () => boolean
  
  // Admin auth actions
  loginAdmin: (email: string, password: string) => Admin | null
  logoutAdmin: () => void
  updateAdmin: (updates: Partial<Admin>) => void
  
  // Job actions
  addJob: (job: Omit<Job, 'id' | 'created_at' | 'updated_at'>) => Job
  updateJob: (id: string, updates: Partial<Job>) => void
  updateJobStatus: (id: string, status: JobStatus) => void
  deleteJob: (id: string) => void
  
  // Technician actions
  addTechnician: (tech: Omit<Technician, 'id' | 'created_at' | 'last_login' | 'role' | 'assigned_jobs'>) => void
  updateTechnician: (id: string, updates: Partial<Technician>) => void
  deleteTechnician: (id: string) => void
  loginTechnician: (pin: string) => Technician | null
  logoutTechnician: () => void
  
  // Photo actions
  addPhoto: (photo: Omit<JobPhoto, 'id' | 'uploaded_at'>) => void
  deletePhoto: (id: string) => void
  
  // SMS actions
  addSmsLog: (log: Omit<SmsLog, 'id' | 'sent_at'>) => void
  
  // Template actions
  addTemplate: (template: Omit<SmsTemplate, 'id' | 'created_at' | 'updated_at'>) => void
  updateTemplate: (id: string, updates: Partial<SmsTemplate>) => void
  deleteTemplate: (id: string) => void
  
  // Settings actions
  updateSettings: (updates: Partial<CompanySettings>) => void
  
  // Subscription actions
  updateSubscription: (updates: Partial<Subscription>) => void
  updateNotificationPreferences: (updates: Partial<NotificationPreferences>) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Core data
      jobs: initialJobs,
      technicians: initialTechnicians,
      photos: [],
      smsLogs: [],
      templates: initialTemplates,
      settings: initialSettings,
      
      // Auth state
      currentAdmin: initialAdmin,
      currentTechId: null,
      isAdminAuthenticated: true, // Start authenticated for demo
      
      // Subscription & billing
      subscription: initialSubscription,
      invoices: initialInvoices,
      notificationPreferences: initialNotificationPreferences,
      
      // Role checks
      isAdmin: () => get().isAdminAuthenticated && get().currentAdmin !== null,
      isTechnician: () => get().currentTechId !== null,
      
      // Admin auth actions
      loginAdmin: (email, password) => {
        // Simple mock auth - in production would check password hash
        const admin = initialAdmin
        if (email === admin.email && password === 'demo123') {
          const updatedAdmin = { ...admin, last_login: new Date().toISOString() }
          set({ currentAdmin: updatedAdmin, isAdminAuthenticated: true })
          return updatedAdmin
        }
        return null
      },
      
      logoutAdmin: () => {
        set({ currentAdmin: null, isAdminAuthenticated: false })
      },
      
      updateAdmin: (updates) => {
        set((state) => ({
          currentAdmin: state.currentAdmin 
            ? { ...state.currentAdmin, ...updates }
            : null
        }))
      },
      
      // Job actions
      addJob: (jobData) => {
        const newJob: Job = {
          ...jobData,
          id: generateId(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        set((state) => ({ jobs: [...state.jobs, newJob] }))
        return newJob
      },
      
      updateJob: (id, updates) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id
              ? { ...job, ...updates, updated_at: new Date().toISOString() }
              : job
          ),
        }))
      },
      
      updateJobStatus: (id, status) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id
              ? { ...job, status, updated_at: new Date().toISOString() }
              : job
          ),
        }))
      },
      
      deleteJob: (id) => {
        set((state) => ({
          jobs: state.jobs.filter((job) => job.id !== id),
          photos: state.photos.filter((photo) => photo.job_id !== id),
        }))
      },
      
      // Technician actions
      addTechnician: (techData) => {
        const newTech: Technician = {
          ...techData,
          id: `tech-${generateId()}`,
          role: 'technician',
          created_at: new Date().toISOString(),
          last_login: null,
          assigned_jobs: [],
        }
        set((state) => ({ technicians: [...state.technicians, newTech] }))
      },
      
      updateTechnician: (id, updates) => {
        set((state) => ({
          technicians: state.technicians.map((tech) =>
            tech.id === id ? { ...tech, ...updates } : tech
          ),
        }))
      },
      
      deleteTechnician: (id) => {
        set((state) => ({
          technicians: state.technicians.filter((tech) => tech.id !== id),
        }))
      },
      
      loginTechnician: (pin) => {
        const tech = get().technicians.find((t) => t.pin === pin && t.is_active)
        if (tech) {
          const updatedTech = { ...tech, last_login: new Date().toISOString() }
          set((state) => ({ 
            currentTechId: tech.id,
            technicians: state.technicians.map((t) => 
              t.id === tech.id ? updatedTech : t
            )
          }))
          return updatedTech
        }
        return null
      },
      
      logoutTechnician: () => {
        set({ currentTechId: null })
      },
      
      // Photo actions
      addPhoto: (photoData) => {
        const newPhoto: JobPhoto = {
          ...photoData,
          id: generateId(),
          uploaded_at: new Date().toISOString(),
        }
        set((state) => ({ photos: [...state.photos, newPhoto] }))
      },
      
      deletePhoto: (id) => {
        set((state) => ({
          photos: state.photos.filter((photo) => photo.id !== id),
        }))
      },
      
      // SMS actions
      addSmsLog: (logData) => {
        const newLog: SmsLog = {
          ...logData,
          id: generateId(),
          sent_at: new Date().toISOString(),
        }
        set((state) => ({ smsLogs: [...state.smsLogs, newLog] }))
      },
      
      // Template actions
      addTemplate: (templateData) => {
        const newTemplate: SmsTemplate = {
          ...templateData,
          id: generateId(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        set((state) => ({ templates: [...state.templates, newTemplate] }))
      },
      
      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id
              ? { ...template, ...updates, updated_at: new Date().toISOString() }
              : template
          ),
        }))
      },
      
      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((template) => template.id !== id),
        }))
      },
      
      // Settings actions
      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates, updated_at: new Date().toISOString() },
        }))
      },
      
      // Subscription actions
      updateSubscription: (updates) => {
        set((state) => ({
          subscription: { ...state.subscription, ...updates },
        }))
      },
      
      updateNotificationPreferences: (updates) => {
        set((state) => ({
          notificationPreferences: { ...state.notificationPreferences, ...updates },
        }))
      },
    }),
    {
      name: 'dispatchly-storage',
    }
  )
)

// Helper to get technician by ID
export const getTechnicianById = (technicians: Technician[], id: string | null) => {
  if (!id) return null
  return technicians.find((t) => t.id === id) || null
}

// Helper to get photos by job ID
export const getPhotosByJobId = (photos: JobPhoto[], jobId: string) => {
  return photos.filter((p) => p.job_id === jobId)
}

// Helper to render SMS template
export const renderTemplate = (
  template: string,
  job: Job,
  tech: Technician | null,
  settings: CompanySettings
) => {
  return template
    .replace(/{customer_name}/g, job.customer_name)
    .replace(/{address}/g, job.customer_address)
    .replace(/{job_type}/g, job.job_type)
    .replace(/{tech_name}/g, tech?.name || 'Your technician')
    .replace(/{company_name}/g, settings.company_name)
    .replace(/{company_phone}/g, settings.company_phone)
    .replace(/{eta}/g, '15-20 minutes')
}

// Helper to mask phone numbers for technician view
export const maskPhoneNumber = (phone: string) => {
  // Returns format: (555) ***-****
  const match = phone.match(/^\((\d{3})\)/)
  if (match) {
    return `(${match[1]}) ***-****`
  }
  return '***-***-****'
}

// Helper to get jobs assigned to a technician
export const getTechnicianJobs = (jobs: Job[], techId: string) => {
  return jobs.filter((j) => j.assigned_tech_id === techId)
}
