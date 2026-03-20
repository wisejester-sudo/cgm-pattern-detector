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
  updateJobStatus: (id: string, status: JobStatus) => void
  deleteJob: (id: string) => Promise<void>
  
  // Technician actions
  addTechnician: (tech: Omit<Technician, 'id' | 'created_at' | 'last_login' | 'role' | 'assigned_jobs'>) => Promise<Technician>
  updateTechnician: (id: string, updates: Partial<Technician>) => void
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
        // First, try to save to Supabase API
        try {
          const response = await fetch('/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jobData),
          })
          
          if (response.ok) {
            const savedJob = await response.json()
            set((state) => ({ jobs: [...state.jobs, savedJob] }))
            return savedJob
          }
        } catch (error) {
          console.error('Failed to save job to API:', error)
        }
        
        // Fallback: create locally if API fails
        const newJob: Job = {
          ...jobData,
          id: generateId(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        set((state) => ({ jobs: [...state.jobs, newJob] }))
        return newJob
      },
      
      updateJob: async (id, updates) => {
        // Try to update via API first
        try {
          const response = await fetch(`/api/jobs/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          })
          
          if (!response.ok) {
            console.error('Failed to update job via API:', await response.text())
          }
        } catch (error) {
          console.error('Error updating job:', error)
        }
        
        // Update local state regardless
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
      
      deleteJob: async (id) => {
        // Try to delete from Supabase first
        try {
          const response = await fetch(`/api/jobs/${id}`, {
            method: 'DELETE',
          })
          
          if (!response.ok) {
            console.error('Failed to delete job from API:', await response.text())
            // Continue with local deletion even if API fails
          }
        } catch (error) {
          console.error('Error deleting job:', error)
          // Continue with local deletion even if API fails
        }
        
        // Remove from local state
        set((state) => ({
          jobs: state.jobs.filter((job) => job.id !== id),
          photos: state.photos.filter((photo) => photo.job_id !== id),
        }))
      },
      
      // Technician actions
      addTechnician: async (techData) => {
        // Try to save to Supabase first
        try {
          const response = await fetch('/api/technicians', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(techData),
          })
          
          if (response.ok) {
            const savedTech = await response.json()
            set((state) => ({ technicians: [...state.technicians, savedTech] }))
            return savedTech
          }
        } catch (error) {
          console.error('Failed to save technician to API:', error)
        }
        
        // Fallback: create locally
        const newTech: Technician = {
          ...techData,
          id: `tech-${generateId()}`,
          role: 'technician',
          created_at: new Date().toISOString(),
          last_login: null,
          assigned_jobs: [],
        }
        set((state) => ({ technicians: [...state.technicians, newTech] }))
        return newTech
      },
      
      updateTechnician: (id, updates) => {
        set((state) => ({
          technicians: state.technicians.map((tech) =>
            tech.id === id ? { ...tech, ...updates } : tech
          ),
        }))
      },
      
      deleteTechnician: async (id) => {
        // Try to delete from Supabase first
        try {
          const response = await fetch(`/api/technicians/${id}`, {
            method: 'DELETE',
          })
          
          if (!response.ok) {
            console.error('Failed to delete technician from API:', await response.text())
            // Continue with local deletion even if API fails
          }
        } catch (error) {
          console.error('Error deleting technician:', error)
          // Continue with local deletion even if API fails
        }
        
        // Remove from local state
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

      // Supabase sync actions
      // These only update the store if Supabase returns actual data
      // If no data is returned, we keep the existing demo data
      loadJobsFromSupabase: async () => {
        try {
          const response = await fetch('/api/jobs')
          if (!response.ok) {
            // Keep using demo data if API fails
            return
          }
          const data = await response.json()
          // Handle paginated response format: { jobs: [...], pagination: {...} }
          const jobs = data.jobs || data
          if (Array.isArray(jobs)) {
            set({ jobs })
          }
        } catch (error) {
          // Keep using demo data on error
        }
      },

      loadTechniciansFromSupabase: async () => {
        try {
          const response = await fetch('/api/technicians')
          if (!response.ok) {
            return
          }
          const data = await response.json()
          // Handle paginated response format: { technicians: [...], pagination: {...} }
          const technicians = data.technicians || data
          if (Array.isArray(technicians)) {
            set({ technicians })
          }
        } catch (error) {
          // Keep using demo data on error
        }
      },

      loadTemplatesFromSupabase: async () => {
        try {
          const response = await fetch('/api/templates')
          if (!response.ok) {
            return
          }
          const data = await response.json()
          // Handle paginated response format: { templates: [...], pagination: {...} }
          const templates = data.templates || data
          if (Array.isArray(templates)) {
            set({ templates })
          }
        } catch {
          // Keep using default templates on error
        }
      },
      
      // Refresh user profile from Supabase (for updating after profile changes)
      refreshUserProfile: async () => {
        try {
          console.log('[Store] Refreshing user profile...')
          const response = await fetch('/api/auth/user-profile')
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
          const response = await fetch('/api/auth/user-profile')
          if (!response.ok) {
            return
          }
          const profile = await response.json()
          
          // Skip if demo profile (not authenticated)
          if (profile.id === 'demo') {
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
            const settingsResponse = await fetch('/api/settings')
            if (settingsResponse.ok) {
              const settingsData = await settingsResponse.json()
              if (settingsData && settingsData.company_name) {
                set({ settings: settingsData })
              }
            }
          } catch {
            // Fall through — metadata values are already set above
          }
          
          // Load jobs, technicians, templates
          await Promise.all([
            get().loadJobsFromSupabase(),
            get().loadTechniciansFromSupabase(),
            get().loadTemplatesFromSupabase(),
          ])
          
          // Mark as initialized
          set({ isInitialized: true })
          console.log('[Store] Initialization complete')
        } catch {
          // Silently fail — user will see empty state
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

// Helper to get technician by ID
export const getTechnicianById = (technicians: Technician[], id: string | null) => {
  if (!id) return null
  return technicians.find((t) => t.id === id) || null
}

// Helper to get multiple technicians by IDs
export const getTechniciansByIds = (technicians: Technician[], ids: string[] | null) => {
  if (!ids || ids.length === 0) return []
  return technicians.filter((t) => ids.includes(t.id))
}

// Helper to get jobs assigned to a technician (now checks array)
export const getTechnicianJobs = (jobs: Job[], techId: string) => {
  return jobs.filter((j) => j.assigned_tech_ids?.includes(techId) ?? false)
}

// Helper to get available jobs (status === 'available')
export const getAvailableJobs = (jobs: Job[]) => {
  return jobs.filter((j) => j.status === 'available')
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
