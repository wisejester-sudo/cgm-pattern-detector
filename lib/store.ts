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
  NotificationPreferences,
  Notification
} from './types'

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15)

// CSRF Token helper - gets token from client-readable cookie
function getCSRFToken(): string | null {
  if (typeof document === 'undefined') return null
  
  // Debug: log all cookies
  console.log('[CSRF Debug] All cookies:', document.cookie)
  
  // Try client-readable cookie first, fall back to legacy cookie name
  const clientMatch = document.cookie.match(/csrf-token-client=([^;]+)/)
  const legacyMatch = document.cookie.match(/csrf-token=([^;]+)/)
  
  console.log('[CSRF Debug] Client cookie match:', clientMatch ? 'found' : 'not found')
  console.log('[CSRF Debug] Legacy cookie match:', legacyMatch ? 'found' : 'not found')
  
  const token = clientMatch?.[1] || legacyMatch?.[1] || null
  console.log('[CSRF Debug] Token:', token ? `${token.substring(0, 8)}...` : 'null')
  
  return token
}

// Fetch wrapper that includes CSRF token for state-changing requests
async function fetchWithCSRF(url: string, options: RequestInit = {}): Promise<Response> {
  const method = options.method?.toUpperCase() || 'GET'
  const stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE']
  
  // Only add CSRF token for state-changing methods
  if (stateChangingMethods.includes(method)) {
    const csrfToken = getCSRFToken()
    if (csrfToken) {
      console.log('[CSRF Debug] Adding token to request')
      options.headers = {
        ...options.headers,
        'x-csrf-token': csrfToken,
      }
    } else {
      console.warn('[CSRF Debug] No CSRF token found! Request may fail.')
      // TEMPORARY: Still make the request even without token (for debugging)
      // Remove this line once CSRF is working properly
    }
  }
  
  return fetch(url, options)
}

// Empty initial state - will be populated from Supabase or user data
const emptyAdmin: Admin | null = null

const emptySettings: CompanySettings = {
  id: '',
  company_name: '',
  company_phone: '',
  trade_type: '',
  custom_job_types: [],
  default_sms_template_id: null,
  updated_at: new Date().toISOString(),
  logo_url: null,
  primary_color: '#3b82f6',
  tagline: '',
  business_hours: '',
  service_area: '',
}

// Generate trade-specific SMS templates
function getTradeSpecificTemplates(tradeType: string): SmsTemplate[] {
  const baseTemplates: SmsTemplate[] = [
    {
      id: 'default-1',
      name: 'En Route Notification',
      template_body: 'Hi {customer_name}, your technician {tech_name} is on the way to {address}. ETA: {eta}. Questions? Call {company_phone}.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'default-2',
      name: 'Job Complete',
      template_body: 'Hi {customer_name}, your {job_type} service has been completed. Thank you for choosing {company_name}!',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]

  const tradeSpecificTemplates: Record<string, SmsTemplate[]> = {
    hvac: [
      {
        id: 'hvac-1',
        name: 'AC Repair',
        template_body: 'Hi {customer_name}, your AC repair is scheduled for {scheduled_time}. Our technician will arrive within the appointment window. Questions? Call {company_phone}.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'hvac-2',
        name: 'Furnace Maintenance',
        template_body: 'Hi {customer_name}, your furnace maintenance is scheduled for {scheduled_time}. Please ensure clear access to the unit. Questions? Call {company_phone}.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'hvac-3',
        name: 'System Tune-up',
        template_body: 'Hi {customer_name}, your HVAC system tune-up is scheduled for {scheduled_time}. This service includes filter change and system check. Questions? Call {company_phone}.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    plumbing: [
      {
        id: 'plumbing-1',
        name: 'Leak Repair',
        template_body: 'Hi {customer_name}, your leak repair is scheduled for {scheduled_time}. Please shut off the main water valve if possible. Questions? Call {company_phone}.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'plumbing-2',
        name: 'Drain Cleaning',
        template_body: 'Hi {customer_name}, your drain cleaning service is scheduled for {scheduled_time}. Please clear the area around drains. Questions? Call {company_phone}.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'plumbing-3',
        name: 'Water Heater Service',
        template_body: 'Hi {customer_name}, your water heater service is scheduled for {scheduled_time}. Please ensure clear access to the unit. Questions? Call {company_phone}.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    electrical: [
      {
        id: 'electrical-1',
        name: 'Panel Upgrade',
        template_body: 'Hi {customer_name}, your electrical panel upgrade is scheduled for {scheduled_time}. Power may need to be shut off temporarily. Questions? Call {company_phone}.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'electrical-2',
        name: 'Outlet Installation',
        template_body: 'Hi {customer_name}, your outlet installation is scheduled for {scheduled_time}. Our electrician will arrive within the appointment window. Questions? Call {company_phone}.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'electrical-3',
        name: 'Wiring Repair',
        template_body: 'Hi {customer_name}, your wiring repair service is scheduled for {scheduled_time}. Power may need to be shut off temporarily. Questions? Call {company_phone}.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    landscaping: [
      {
        id: 'landscaping-1',
        name: 'Lawn Care',
        template_body: 'Hi {customer_name}, your lawn care service is scheduled for {scheduled_time}. Please ensure yard access is clear. Questions? Call {company_phone}.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'landscaping-2',
        name: 'Tree Trimming',
        template_body: 'Hi {customer_name}, your tree trimming service is scheduled for {scheduled_time}. Please ensure clear access to trees. Questions? Call {company_phone}.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'landscaping-3',
        name: 'Seasonal Cleanup',
        template_body: 'Hi {customer_name}, your seasonal cleanup is scheduled for {scheduled_time}. Please ensure yard debris is accessible. Questions? Call {company_phone}.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    cleaning: [
      {
        id: 'cleaning-1',
        name: 'Deep Clean',
        template_body: 'Hi {customer_name}, your deep cleaning service is scheduled for {scheduled_time}. Please ensure access to all areas. Questions? Call {company_phone}.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'cleaning-2',
        name: 'Move-out Cleaning',
        template_body: 'Hi {customer_name}, your move-out cleaning is scheduled for {scheduled_time}. Keys or access instructions appreciated. Questions? Call {company_phone}.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'cleaning-3',
        name: 'Office Cleaning',
        template_body: 'Hi {customer_name}, your office cleaning is scheduled for {scheduled_time}. Please ensure building access. Questions? Call {company_phone}.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    generic: [
      {
        id: 'generic-1',
        name: 'Service Call',
        template_body: 'Hi {customer_name}, your service call is scheduled for {scheduled_time}. Our technician will arrive within the appointment window. Questions? Call {company_phone}.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'generic-2',
        name: 'Installation',
        template_body: 'Hi {customer_name}, your installation is scheduled for {scheduled_time}. Please ensure clear access to the work area. Questions? Call {company_phone}.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'generic-3',
        name: 'Maintenance',
        template_body: 'Hi {customer_name}, your maintenance service is scheduled for {scheduled_time}. Our technician will arrive within the appointment window. Questions? Call {company_phone}.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  }

  const specificTemplates = tradeSpecificTemplates[tradeType] || tradeSpecificTemplates['generic']
  return [...baseTemplates, ...specificTemplates]
}

// Default SMS templates for new accounts
const defaultTemplates: SmsTemplate[] = [
  {
    id: 'default-1',
    name: 'En Route Notification',
    template_body: 'Hi {customer_name}, your technician {tech_name} is on the way to {address}. ETA: {eta}. Questions? Call {company_phone}.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'default-2',
    name: 'Job Complete',
    template_body: 'Hi {customer_name}, your {job_type} service has been completed. Thank you for choosing {company_name}!',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const initialSubscription: Subscription = {
  id: '',
  plan: 'free',
  status: 'active',
  current_period_start: new Date().toISOString(),
  current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  sms_used_this_month: 0,
  sms_limit: 100,
}

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
  
  // Initialization state
  isInitialized: boolean
  
  // Subscription & billing
  subscription: Subscription
  invoices: Invoice[]
  notificationPreferences: NotificationPreferences
  
  // Notifications
  notifications: Notification[]
  unreadCount: number
  
  // Role checks (computed)
  isAdmin: () => boolean
  isTechnician: () => boolean
  
  // Admin auth actions
  loginAdmin: (email: string, password: string) => Admin | null
  logoutAdmin: () => void
  updateAdmin: (updates: Partial<Admin>) => void
  
  // Job actions
  addJob: (job: Omit<Job, 'id' | 'created_at' | 'updated_at'>) => Promise<Job>
  updateJob: (id: string, updates: Partial<Job>) => Promise<void>
  updateJobStatus: (id: string, status: JobStatus) => Promise<void>
  deleteJob: (id: string) => Promise<void>
  
  // Technician actions
  addTechnician: (tech: Omit<Technician, 'id' | 'created_at' | 'last_login' | 'role' | 'assigned_jobs'>) => Promise<Technician>
  updateTechnician: (id: string, updates: Partial<Technician>) => Promise<void>
  deleteTechnician: (id: string) => Promise<void>
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
  
  // Supabase sync actions
  loadJobsFromSupabase: () => Promise<void>
  loadTechniciansFromSupabase: () => Promise<void>
  loadTemplatesFromSupabase: () => Promise<void>
  loadSmsLogsFromSupabase: (jobId?: string) => Promise<void>
  loadNotificationsFromSupabase: () => Promise<void>
  markNotificationsAsRead: (ids?: string[]) => Promise<void>
  markAllNotificationsAsRead: () => Promise<void>
  
  // User initialization - fetches user profile and settings from Supabase
  initializeUserFromSupabase: () => Promise<void>
  
  // Refresh user profile (for updating after profile changes)
  refreshUserProfile: () => Promise<void>
  
  // Reset store to empty state (for logout)
  resetStore: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Core data - start empty, populated from Supabase or user signup
      jobs: [],
      technicians: [],
      photos: [],
      smsLogs: [],
      templates: defaultTemplates,
      settings: emptySettings,
      
      // Auth state - not authenticated by default
      currentAdmin: emptyAdmin,
      currentTechId: null,
      isAdminAuthenticated: false,
      
      // Initialization state
      isInitialized: false,
      
      // Subscription & billing
      subscription: initialSubscription,
      invoices: [],
      notificationPreferences: initialNotificationPreferences,
      
      // Notifications
      notifications: [],
      unreadCount: 0,
      
      // Role checks
      isAdmin: () => get().isAdminAuthenticated && get().currentAdmin !== null,
      isTechnician: () => get().currentTechId !== null,
      
      // Admin auth actions
      loginAdmin: (email, password) => {
        // This is called after Supabase auth succeeds
        // The actual auth is handled by Supabase, this just sets up the local state
        const admin: Admin = {
          id: generateId(),
          name: email.split('@')[0],
          email: email,
          phone: '',
          role: 'admin',
          is_active: true,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          avatar_url: null,
        }
        set({ currentAdmin: admin, isAdminAuthenticated: true })
        return admin
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
      addJob: async (jobData) => {
        // Save to Supabase API - no local fallback to prevent phantom data
        const response = await fetchWithCSRF('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jobData),
        })
        
        if (!response.ok) {
          let errorMessage = 'Failed to create job'
          let errorDetails = null
          
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
            errorDetails = errorData.details || null
          } catch {
            // If JSON parsing fails, use status text
            errorMessage = response.statusText || errorMessage
          }
          
          console.error('Failed to save job to API:', errorMessage, errorDetails)
          
          // Create error with details attached
          const error = new Error(errorMessage) as Error & { details?: Record<string, string> }
          if (errorDetails) {
            error.details = errorDetails
          }
          throw error
        }
        
        const savedJob = await response.json()
        set((state) => ({ jobs: [...state.jobs, savedJob.job] }))
        return savedJob.job
      },
      
      updateJob: async (id, updates) => {
        // Save previous state for rollback
        const previousJobs = get().jobs
        
        // Optimistic update
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id
              ? { ...job, ...updates, updated_at: new Date().toISOString() }
              : job
          ),
        }))
        
        // Try to update via API
        try {
          const response = await fetchWithCSRF(`/api/jobs/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          })
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error('Failed to update job via API:', errorText)
            throw new Error(`Failed to update job: ${errorText}`)
          }
        } catch (error) {
          // Rollback on failure
          console.error('Error updating job, rolling back:', error)
          set({ jobs: previousJobs })
          throw error
        }
      },
      
      updateJobStatus: async (id, status) => {
        // Save previous state for rollback
        const previousJobs = get().jobs
        
        // Optimistic update
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id
              ? { ...job, status, updated_at: new Date().toISOString() }
              : job
          ),
        }))
        
        // Try to update via API
        try {
          const response = await fetchWithCSRF(`/api/jobs/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
          })
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error('Failed to update job status via API:', errorText)
            throw new Error(`Failed to update job status: ${errorText}`)
          }
        } catch (error) {
          // Rollback on failure
          console.error('Error updating job status, rolling back:', error)
          set({ jobs: previousJobs })
          throw error
        }
      },
      
      deleteJob: async (id) => {
        // Try to delete from Supabase first
        try {
          const response = await fetchWithCSRF(`/api/jobs/${id}`, {
            method: 'DELETE',
          })
          
          if (!response.ok) {
            console.error('Failed to delete job from API:', await response.text())
            throw new Error('Failed to delete job from API')
          }
          
          // Only remove from local state if API succeeds
          set((state) => ({
            jobs: state.jobs.filter((job) => job.id !== id),
            photos: state.photos.filter((photo) => photo.job_id !== id),
          }))
        } catch (error) {
          console.error('Error deleting job:', error)
          throw error // Re-throw so caller knows it failed
        }
      },
      
      // Technician actions
      addTechnician: async (techData) => {
        // Save to Supabase API - no local fallback to prevent phantom data
        const response = await fetchWithCSRF('/api/technicians', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(techData),
        })
        
        if (!response.ok) {
          let errorMessage = 'Failed to create technician'
          let errorDetails = null
          
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
            errorDetails = errorData.details || null
          } catch {
            errorMessage = response.statusText || errorMessage
          }
          
          console.error('Failed to save technician to API:', errorMessage, errorDetails)
          
          // Create error with details attached
          const error = new Error(errorMessage) as Error & { details?: Record<string, string> }
          if (errorDetails) {
            error.details = errorDetails
          }
          throw error
        }
        
        const savedTech = await response.json()
        set((state) => ({ technicians: [...state.technicians, savedTech.technician] }))
        return savedTech.technician
      },
      
      updateTechnician: async (id, updates) => {
        // Save previous state for rollback
        const previousTechnicians = get().technicians
        
        // Optimistic update
        set((state) => ({
          technicians: state.technicians.map((tech) =>
            tech.id === id ? { ...tech, ...updates } : tech
          ),
        }))
        
        // Try to update via API
        try {
          const response = await fetchWithCSRF(`/api/technicians/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          })
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error('Failed to update technician via API:', errorText)
            throw new Error(`Failed to update technician: ${errorText}`)
          }
        } catch (error) {
          // Rollback on failure
          console.error('Error updating technician, rolling back:', error)
          set({ technicians: previousTechnicians })
          throw error
        }
      },
      
      deleteTechnician: async (id) => {
        // Try to delete from Supabase first
        try {
          const response = await fetchWithCSRF(`/api/technicians/${id}`, {
            method: 'DELETE',
          })
          
          if (!response.ok) {
            console.error('Failed to delete technician from API:', await response.text())
            throw new Error('Failed to delete technician from API')
          }
          
          // Only remove from local state if API succeeds
          set((state) => ({
            technicians: state.technicians.filter((tech) => tech.id !== id),
          }))
        } catch (error) {
          console.error('Error deleting technician:', error)
          throw error // Re-throw so caller knows it failed
        }
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

      // Supabase sync actions
      // These only update the store if Supabase returns actual data
      // If no data is returned, we keep the existing demo data
      loadJobsFromSupabase: async () => {
        try {
          const response = await fetchWithCSRF('/api/jobs')
          if (!response.ok) {
            console.error('[Store] Failed to load jobs:', response.status, response.statusText)
            return
          }
          const data = await response.json()
          // Handle paginated response format: { jobs: [...], pagination: {...} }
          const jobs = data.jobs || data
          if (Array.isArray(jobs)) {
            set({ jobs })
          }
        } catch (error) {
          console.error('[Store] Error loading jobs:', error)
        }
      },

      loadTechniciansFromSupabase: async () => {
        try {
          const response = await fetchWithCSRF('/api/technicians')
          if (!response.ok) {
            console.error('[Store] Failed to load technicians:', response.status, response.statusText)
            return
          }
          const data = await response.json()
          // Handle paginated response format: { technicians: [...], pagination: {...} }
          const technicians = data.technicians || data
          if (Array.isArray(technicians)) {
            set({ technicians })
          }
        } catch (error) {
          console.error('[Store] Error loading technicians:', error)
        }
      },

      loadTemplatesFromSupabase: async () => {
        try {
          const response = await fetchWithCSRF('/api/templates')
          if (!response.ok) {
            console.error('[Store] Failed to load templates:', response.status, response.statusText)
            return
          }
          const data = await response.json()
          // Handle paginated response format: { templates: [...], pagination: {...} }
          const templates = data.templates || data
          if (Array.isArray(templates)) {
            set({ templates })
          }
        } catch (error) {
          console.error('[Store] Error loading templates:', error)
        }
      },

      loadSmsLogsFromSupabase: async (jobId?: string) => {
        try {
          const url = jobId ? `/api/sms?job_id=${jobId}` : '/api/sms'
          const response = await fetchWithCSRF(url)
          if (!response.ok) {
            console.error('[Store] Failed to load SMS logs:', response.status, response.statusText)
            return
          }
          const data = await response.json()
          const smsLogs = data.smsLogs || data
          if (Array.isArray(smsLogs)) {
            set({ smsLogs })
          }
        } catch (error) {
          console.error('[Store] Error loading SMS logs:', error)
        }
      },
      
      // Notifications - load from Supabase
      loadNotificationsFromSupabase: async () => {
        try {
          const response = await fetchWithCSRF('/api/notifications')
          if (!response.ok) {
            console.error('[Store] Failed to load notifications:', response.status)
            return
          }
          const data = await response.json()
          set({ 
            notifications: data.notifications || [],
            unreadCount: data.unreadCount || 0
          })
        } catch (error) {
          console.error('[Store] Error loading notifications:', error)
        }
      },
      
      // Mark notifications as read
      markNotificationsAsRead: async (ids?: string[]) => {
        try {
          const response = await fetchWithCSRF('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationIds: ids, markAll: !ids }),
          })
          if (!response.ok) {
            console.error('[Store] Failed to mark notifications as read:', response.status)
            return
          }
          // Refresh notifications
          const { loadNotificationsFromSupabase } = get()
          await loadNotificationsFromSupabase()
        } catch (error) {
          console.error('[Store] Error marking notifications as read:', error)
        }
      },
      
      // Mark all notifications as read
      markAllNotificationsAsRead: async () => {
        try {
          const response = await fetchWithCSRF('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ markAll: true }),
          })
          if (!response.ok) {
            console.error('[Store] Failed to mark all notifications as read:', response.status)
            return
          }
          // Update local state immediately for responsiveness
          set(state => ({
            notifications: state.notifications.map(n => ({ ...n, is_read: true })),
            unreadCount: 0
          }))
        } catch (error) {
          console.error('[Store] Error marking all notifications as read:', error)
        }
      },
      
      // Refresh user profile from Supabase (for updating after profile changes)
      refreshUserProfile: async () => {
        try {
          console.log('[Store] Refreshing user profile...')
          const response = await fetchWithCSRF('/api/auth/user-profile')
          if (!response.ok) {
            console.error('[Store] Failed to refresh profile:', response.status)
            return
          }
          const profile = await response.json()
          
          // Skip if demo profile
          if (profile.id === 'demo') {
            return
          }
          
          // Update admin data from fresh profile
          const admin: Admin = {
            id: profile.id,
            name: profile.full_name || profile.email?.split('@')[0] || 'User',
            email: profile.email || '',
            phone: profile.phone || profile.company_phone || '',
            role: 'admin',
            is_active: true,
            created_at: get().currentAdmin?.created_at || new Date().toISOString(),
            last_login: new Date().toISOString(),
            avatar_url: null,
          }
          
          set({ currentAdmin: admin })
          console.log('[Store] Profile refreshed successfully:', admin.name)
        } catch (error) {
          console.error('[Store] Error refreshing profile:', error)
        }
      },

      // Initialize user from Supabase auth and profile data
      initializeUserFromSupabase: async () => {
        // Skip if already initialized (use refreshUserProfile for updates)
        if (get().isInitialized) {
          console.log('[Store] Already initialized, skipping...')
          return
        }
        
        try {
          // Fetch user profile from API
          const response = await fetchWithCSRF('/api/auth/user-profile')
          if (!response.ok) {
            console.error('[Store] Failed to fetch user profile:', response.status)
            return
          }
          const profile = await response.json()
          
          // Skip if demo profile (not authenticated)
          if (profile.id === 'demo') {
            console.log('[Store] Demo profile detected, skipping initialization')
            return
          }
          
          // Set admin data from profile (using metadata set during signup)
          const admin: Admin = {
            id: profile.id,
            name: profile.full_name || profile.email?.split('@')[0] || 'User',
            email: profile.email || '',
            phone: profile.phone || profile.company_phone || '',
            role: 'admin',
            is_active: true,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
            avatar_url: null,
          }
          
          set({ currentAdmin: admin, isAdminAuthenticated: true })
          
          // Get trade type from profile or use generic
          const tradeType = profile.trade_type || 'generic'
          
          // Load trade-specific templates
          const tradeTemplates = getTradeSpecificTemplates(tradeType)
          set({ templates: tradeTemplates })
          
          // Populate company settings from user metadata (available immediately after signup)
          if (profile.company_name || profile.company_phone || profile.trade_type) {
            set({
              settings: {
                ...get().settings,
                company_name: profile.company_name || get().settings.company_name,
                company_phone: profile.company_phone || get().settings.company_phone,
                trade_type: profile.trade_type || get().settings.trade_type,
              }
            })
          }
          
          // Try to also fetch persisted company settings from DB (may be empty for new users)
          try {
            const settingsResponse = await fetchWithCSRF('/api/settings')
            if (settingsResponse.ok) {
              const settingsData = await settingsResponse.json()
              if (settingsData && settingsData.company_name) {
                set({ settings: settingsData })
              }
            }
          } catch (error) {
            console.error('[Store] Error loading settings:', error)
            // Fall through — metadata values are already set above
          }
          
          // Load jobs, technicians, templates
          await Promise.all([
            get().loadJobsFromSupabase(),
            get().loadTechniciansFromSupabase(),
            get().loadTemplatesFromSupabase(),
          ])
          
          // Mark as initialized only after successful data load
          set({ isInitialized: true })
          console.log('[Store] Initialization complete')
        } catch (error) {
          console.error('[Store] Initialization failed:', error)
          // Don't mark as initialized on failure
        }
      },
      
      // Reset store to empty state
      resetStore: () => {
        set({
          jobs: [],
          technicians: [],
          photos: [],
          smsLogs: [],
          templates: defaultTemplates,
          settings: emptySettings,
          currentAdmin: null,
          currentTechId: null,
          isAdminAuthenticated: false,
          isInitialized: false,
          subscription: initialSubscription,
          invoices: [],
          notificationPreferences: initialNotificationPreferences,
        })
      },
    }),
    {
      name: 'dispatchly-storage',
    }
  )
)

/**
 * Get a technician by their ID
 * @param technicians - Array of technicians to search
 * @param id - Technician ID to find
 * @returns Technician object or null if not found
 */
export const getTechnicianById = (technicians: Technician[], id: string | null) => {
  if (!id) return null
  return technicians.find((t) => t.id === id) || null
}

/**
 * Get multiple technicians by their IDs
 * @param technicians - Array of all technicians
 * @param ids - Array of technician IDs to find
 * @returns Array of matching technicians
 */
export const getTechniciansByIds = (technicians: Technician[], ids: string[] | null) => {
  if (!ids || ids.length === 0) return []
  return technicians.filter((t) => ids.includes(t.id))
}

/**
 * Get jobs assigned to a specific technician
 * @param jobs - Array of all jobs
 * @param techId - Technician ID to filter by
 * @returns Array of jobs assigned to the technician
 */
export const getTechnicianJobs = (jobs: Job[], techId: string) => {
  return jobs.filter((j) => j.assigned_tech_ids?.includes(techId) ?? false)
}

/**
 * Get all available jobs (status === 'available')
 * @param jobs - Array of all jobs
 * @returns Array of available jobs
 */
export const getAvailableJobs = (jobs: Job[]) => {
  return jobs.filter((j) => j.status === 'available')
}

/**
 * Get photos for a specific job
 * @param photos - Array of all photos
 * @param jobId - Job ID to filter by
 * @returns Array of photos for the job
 */
export const getPhotosByJobId = (photos: JobPhoto[], jobId: string) => {
  return photos.filter((p) => p.job_id === jobId)
}

/**
 * Render an SMS template with variable substitution and XSS protection
 * @param template - Template string with placeholders like {customer_name}
 * @param job - Job object for variable values
 * @param tech - Technician object (optional)
 * @param settings - Company settings for variable values
 * @returns Rendered template string with escaped values
 */
export const renderTemplate = (
  template: string,
  job: Job,
  tech: Technician | null,
  settings: CompanySettings
) => {
  // Escape HTML to prevent XSS in SMS content
  const escape = (str: string) => str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

  return template
    .replace(/{customer_name}/g, escape(job.customer_name))
    .replace(/{address}/g, escape(job.customer_address))
    .replace(/{job_type}/g, escape(job.job_type))
    .replace(/{tech_name}/g, escape(tech?.name || 'Your technician'))
    .replace(/{company_name}/g, escape(settings.company_name))
    .replace(/{company_phone}/g, escape(settings.company_phone))
    .replace(/{eta}/g, '15-20 minutes')
}

/**
 * Mask a phone number for technician view (privacy protection)
 * @param phone - Full phone number to mask
 * @returns Masked phone number like "(555) ***-****" or "***-***-****"
 */
export const maskPhoneNumber = (phone: string) => {
  // Returns format: (555) ***-****
  const match = phone.match(/^\((\d{3})\)/)
  if (match) {
    return `(${match[1]}) ***-****`
  }
  return '***-***-****'
}
