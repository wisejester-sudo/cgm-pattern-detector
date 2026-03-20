"use client"

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useMemo } from 'react'
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

// ============================================
// SECURE ID GENERATION
// ============================================

/**
 * Generate a cryptographically secure random ID
 * Falls back to timestamp-based ID if crypto is unavailable
 */
function generateSecureId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  
  // Fallback for older browsers
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 11)
  const random2 = Math.random().toString(36).substring(2, 11)
  return `${timestamp}-${random}-${random2}`
}

// ============================================
// TYPES FOR LOADING STATES & ERRORS
// ============================================

type LoadingState = {
  jobs: boolean
  technicians: boolean
  templates: boolean
  settings: boolean
  deletingJob: Record<string, boolean>
  deletingTechnician: Record<string, boolean>
  creatingJob: boolean
  creatingTechnician: boolean
  initializing: boolean
}

type ErrorState = {
  code: string | null
  message: string | null
  field?: string
  timestamp: number | null
  recoveredAt: number | null
}

type CacheState = {
  jobsLastFetched: number | null
  techniciansLastFetched: number | null
  templatesLastFetched: number | null
  settingsLastFetched: number | null
}

// ============================================
// DEFAULTS
// ============================================

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

// ============================================
// TRADE-SPECIFIC TEMPLATES
// ============================================

function getTradeSpecificTemplates(tradeType: string): SmsTemplate[] {
  const baseTemplates: SmsTemplate[] = [...defaultTemplates]

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
    ],
    plumbing: [
      {
        id: 'plumbing-1',
        name: 'Leak Repair',
        template_body: 'Hi {customer_name}, your leak repair is scheduled for {scheduled_time}. Please shut off the main water valve if possible. Questions? Call {company_phone}.',
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
    ],
    generic: [],
  }

  const specificTemplates = tradeSpecificTemplates[tradeType] || tradeSpecificTemplates['generic']
  return [...baseTemplates, ...specificTemplates].map(t => ({ ...t, id: t.id || generateSecureId() }))
}

// ============================================
// APP STATE INTERFACE
// ============================================

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
  
  // Loading states
  loading: LoadingState
  
  // Error state
  error: ErrorState
  
  // Cache state (not persisted)
  cache: CacheState
  
  // Role checks (computed)
  isAdmin: () => boolean
  isTechnician: () => boolean
  
  // Admin auth actions
  loginAdmin: (email: string, password: string) => Admin | null
  logoutAdmin: () => void
  updateAdmin: (updates: Partial<Admin>) => void
  
  // Job actions with loading states
  addJob: (job: Omit<Job, 'id' | 'created_at' | 'updated_at'>) => Promise<Job>
  updateJob: (id: string, updates: Partial<Job>) => void
  updateJobStatus: (id: string, status: JobStatus) => Promise<void>
  deleteJob: (id: string) => Promise<{ success: boolean; error?: string }>
  
  // Technician actions with loading states
  addTechnician: (tech: Omit<Technician, 'id' | 'created_at' | 'last_login' | 'role' | 'assigned_jobs'>) => Promise<Technician>
  updateTechnician: (id: string, updates: Partial<Technician>) => void
  deleteTechnician: (id: string) => Promise<{ success: boolean; error?: string }>
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
  
  // Error handling
  setError: (error: Partial<ErrorState>) => void
  clearError: () => void
  
  // Supabase sync actions
  loadJobsFromSupabase: (force?: boolean) => Promise<void>
  loadTechniciansFromSupabase: (force?: boolean) => Promise<void>
  loadTemplatesFromSupabase: (force?: boolean) => Promise<void>
  
  // User initialization
  initializeUserFromSupabase: () => Promise<void>
  refreshUserProfile: () => Promise<void>
  
  // Reset store
  resetStore: () => void
}

// ============================================
// CACHE DURATION (5 minutes)
// ============================================

const CACHE_DURATION_MS = 5 * 60 * 1000

function isCacheStale(lastFetched: number | null): boolean {
  if (!lastFetched) return true
  return Date.now() - lastFetched > CACHE_DURATION_MS
}

// ============================================
// SELECTORS (For derived state)
// ============================================

export const selectTechnicianById = (technicians: Technician[], id: string | null) => {
  if (!id) return null
  return technicians.find((t) => t.id === id) || null
}

export const selectTechniciansByIds = (technicians: Technician[], ids: string[] | null) => {
  if (!ids || ids.length === 0) return []
  return technicians.filter((t) => ids.includes(t.id))
}

export const selectTechnicianJobs = (jobs: Job[], techId: string) => {
  return jobs.filter((j) => j.assigned_tech_ids?.includes(techId) ?? false)
}

export const selectAvailableJobs = (jobs: Job[]) => {
  return jobs.filter((j) => j.status === 'available')
}

export const selectPhotosByJobId = (photos: JobPhoto[], jobId: string) => {
  return photos.filter((p) => p.job_id === jobId)
}

// Hook for derived state (prevents unnecessary re-renders)
export function useJobById(jobId: string | null) {
  return useStore(state => 
    jobId ? state.jobs.find(j => j.id === jobId) : null
  )
}

export function useTechnicianById(techId: string | null) {
  return useStore(state =>
    techId ? state.technicians.find(t => t.id === techId) : null
  )
}

export function useJobsByStatus(status: JobStatus) {
  return useStore(state => 
    state.jobs.filter(j => j.status === status)
  )
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Core data - start empty
      jobs: [],
      technicians: [],
      photos: [],
      smsLogs: [],
      templates: defaultTemplates,
      settings: emptySettings,
      
      // Auth state
      currentAdmin: emptyAdmin,
      currentTechId: null,
      isAdminAuthenticated: false,
      
      // Initialization state
      isInitialized: false,
      
      // Subscription & billing
      subscription: initialSubscription,
      invoices: [],
      notificationPreferences: initialNotificationPreferences,
      
      // Loading states
      loading: {
        jobs: false,
        technicians: false,
        templates: false,
        settings: false,
        deletingJob: {},
        deletingTechnician: {},
        creatingJob: false,
        creatingTechnician: false,
        initializing: false,
      },
      
      // Error state
      error: {
        code: null,
        message: null,
        timestamp: null,
        recoveredAt: null,
      },
      
      // Cache state (not persisted)
      cache: {
        jobsLastFetched: null,
        techniciansLastFetched: null,
        templatesLastFetched: null,
        settingsLastFetched: null,
      },
      
      // Role checks
      isAdmin: () => get().isAdminAuthenticated && get().currentAdmin !== null,
      isTechnician: () => get().currentTechId !== null,
      
      // Error handling
      setError: (error) => {
        set({
          error: {
            code: error.code || null,
            message: error.message || null,
            field: error.field,
            timestamp: Date.now(),
            recoveredAt: null,
          },
        })
      },
      
      clearError: () => {
        set({
          error: {
            code: null,
            message: null,
            timestamp: null,
            recoveredAt: Date.now(),
          },
        })
      },
      
      // Admin auth actions
      loginAdmin: (email, password) => {
        const admin: Admin = {
          id: generateSecureId(),
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
        // Clear sensitive data from store
        get().resetStore()
      },
      
      updateAdmin: (updates) => {
        set((state) => ({
          currentAdmin: state.currentAdmin 
            ? { ...state.currentAdmin, ...updates }
            : null
        }))
      },
      
      // Job actions with optimistic updates and rollback
      addJob: async (jobData) => {
        const newJob: Job = {
          ...jobData,
          id: generateSecureId(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        
        // Optimistic update
        const previousJobs = get().jobs
        set((state) => ({ 
          jobs: [...state.jobs, newJob],
          loading: { ...state.loading, creatingJob: true },
        }))
        
        try {
          const response = await fetch('/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jobData),
          })
          
          if (!response.ok) {
            throw new Error(`Failed to create job: ${response.statusText}`)
          }
          
          const serverJob = await response.json()
          
          // Replace optimistic job with server job (has correct ID)
          set((state) => ({
            jobs: state.jobs.map(j => j.id === newJob.id ? serverJob : j),
            loading: { ...state.loading, creatingJob: false },
            cache: { ...state.cache, jobsLastFetched: Date.now() },
          }))
          
          return serverJob
        } catch (error) {
          // Rollback on error
          set((state) => ({
            jobs: previousJobs,
            loading: { ...state.loading, creatingJob: false },
            error: {
              code: 'JOB_CREATE_ERROR',
              message: error instanceof Error ? error.message : 'Failed to create job',
              timestamp: Date.now(),
              recoveredAt: null,
            },
          }))
          throw error
        }
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
      
      updateJobStatus: async (id, status) => {
        const previousJobs = get().jobs
        const job = previousJobs.find(j => j.id === id)
        
        if (!job) {
          throw new Error('Job not found')
        }
        
        const previousStatus = job.status
        
        // Optimistic update
        set((state) => ({
          jobs: state.jobs.map((j) =>
            j.id === id
              ? { ...j, status, updated_at: new Date().toISOString() }
              : j
          ),
        }))
        
        try {
          const response = await fetch(`/api/jobs/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
          })
          
          if (!response.ok) {
            throw new Error(`Failed to update status: ${response.statusText}`)
          }
          
          const result = await response.json()
          
          // Update with server response (includes update record)
          if (result.job) {
            set((state) => ({
              jobs: state.jobs.map((j) =>
                j.id === id ? { ...j, ...result.job } : j
              ),
            }))
          }
        } catch (error) {
          // Rollback on error
          set((state) => ({
            jobs: previousJobs,
            error: {
              code: 'STATUS_UPDATE_ERROR',
              message: error instanceof Error ? error.message : 'Failed to update status',
              timestamp: Date.now(),
              recoveredAt: null,
            },
          }))
          throw error
        }
      },
      
      deleteJob: async (id) => {
        const previousJobs = get().jobs
        const previousPhotos = get().photos
        
        // Set loading state for this specific job
        set((state) => ({
          loading: {
            ...state.loading,
            deletingJob: { ...state.loading.deletingJob, [id]: true },
          },
        }))
        
        try {
          const response = await fetch(`/api/jobs/${id}`, {
            method: 'DELETE',
          })
          
          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Failed to delete job: ${errorText}`)
          }
          
          // Only remove from local state after successful API deletion
          set((state) => ({
            jobs: state.jobs.filter((job) => job.id !== id),
            photos: state.photos.filter((photo) => photo.job_id !== id),
            loading: {
              ...state.loading,
              deletingJob: { ...state.loading.deletingJob, [id]: false },
            },
          }))
          
          return { success: true }
        } catch (error) {
          // Rollback - keep the job in the list
          set((state) => ({
            jobs: previousJobs,
            photos: previousPhotos,
            loading: {
              ...state.loading,
              deletingJob: { ...state.loading.deletingJob, [id]: false },
            },
            error: {
              code: 'JOB_DELETE_ERROR',
              message: error instanceof Error ? error.message : 'Failed to delete job',
              timestamp: Date.now(),
              recoveredAt: null,
            },
          }))
          
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to delete job'
          }
        }
      },
      
      // Technician actions with optimistic updates
      addTechnician: async (techData) => {
        const newTech: Technician = {
          ...techData,
          id: `tech-${generateSecureId()}`,
          role: 'technician',
          created_at: new Date().toISOString(),
          last_login: null,
          assigned_jobs: [],
        }
        
        const previousTechnicians = get().technicians
        
        set((state) => ({
          technicians: [...state.technicians, newTech],
          loading: { ...state.loading, creatingTechnician: true },
        }))
        
        try {
          const response = await fetch('/api/technicians', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(techData),
          })
          
          if (!response.ok) {
            throw new Error(`Failed to create technician: ${response.statusText}`)
          }
          
          const serverTech = await response.json()
          
          set((state) => ({
            technicians: state.technicians.map(t => t.id === newTech.id ? serverTech : t),
            loading: { ...state.loading, creatingTechnician: false },
            cache: { ...state.cache, techniciansLastFetched: Date.now() },
          }))
          
          return serverTech
        } catch (error) {
          set((state) => ({
            technicians: previousTechnicians,
            loading: { ...state.loading, creatingTechnician: false },
            error: {
              code: 'TECH_CREATE_ERROR',
              message: error instanceof Error ? error.message : 'Failed to create technician',
              timestamp: Date.now(),
              recoveredAt: null,
            },
          }))
          throw error
        }
      },
      
      updateTechnician: (id, updates) => {
        set((state) => ({
          technicians: state.technicians.map((tech) =>
            tech.id === id ? { ...tech, ...updates } : tech
          ),
        }))
      },
      
      deleteTechnician: async (id) => {
        const previousTechnicians = get().technicians
        
        set((state) => ({
          loading: {
            ...state.loading,
            deletingTechnician: { ...state.loading.deletingTechnician, [id]: true },
          },
        }))
        
        try {
          const response = await fetch(`/api/technicians/${id}`, {
            method: 'DELETE',
          })
          
          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Failed to delete technician: ${errorText}`)
          }
          
          set((state) => ({
            technicians: state.technicians.filter((tech) => tech.id !== id),
            loading: {
              ...state.loading,
              deletingTechnician: { ...state.loading.deletingTechnician, [id]: false },
            },
          }))
          
          return { success: true }
        } catch (error) {
          set((state) => ({
            technicians: previousTechnicians,
            loading: {
              ...state.loading,
              deletingTechnician: { ...state.loading.deletingTechnician, [id]: false },
            },
            error: {
              code: 'TECH_DELETE_ERROR',
              message: error instanceof Error ? error.message : 'Failed to delete technician',
              timestamp: Date.now(),
              recoveredAt: null,
            },
          }))
          
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to delete technician'
          }
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
          id: generateSecureId(),
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
          id: generateSecureId(),
          sent_at: new Date().toISOString(),
        }
        set((state) => ({ smsLogs: [...state.smsLogs, newLog] }))
      },
      
      // Template actions
      addTemplate: (templateData) => {
        const newTemplate: SmsTemplate = {
          ...templateData,
          id: generateSecureId(),
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
          settings: { 
            ...state.settings, 
            ...updates, 
            updated_at: new Date().toISOString() 
          },
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

      // Supabase sync actions with cache checking
      loadJobsFromSupabase: async (force = false) => {
        // Skip if cache is fresh and not forcing
        if (!force && !isCacheStale(get().cache.jobsLastFetched)) {
          console.log('[Store] Using cached jobs')
          return
        }
        
        set((state) => ({
          loading: { ...state.loading, jobs: true },
        }))
        
        try {
          const response = await fetch('/api/jobs')
          if (!response.ok) {
            throw new Error(`Failed to load jobs: ${response.statusText}`)
          }
          const data = await response.json()
          if (Array.isArray(data)) {
            set((state) => ({
              jobs: data,
              loading: { ...state.loading, jobs: false },
              cache: { ...state.cache, jobsLastFetched: Date.now() },
            }))
          }
        } catch (error) {
          console.error('[Store] Error loading jobs:', error)
          set((state) => ({
            loading: { ...state.loading, jobs: false },
            error: {
              code: 'JOBS_LOAD_ERROR',
              message: error instanceof Error ? error.message : 'Failed to load jobs',
              timestamp: Date.now(),
              recoveredAt: null,
            },
          }))
        }
      },

      loadTechniciansFromSupabase: async (force = false) => {
        if (!force && !isCacheStale(get().cache.techniciansLastFetched)) {
          console.log('[Store] Using cached technicians')
          return
        }
        
        set((state) => ({
          loading: { ...state.loading, technicians: true },
        }))
        
        try {
          const response = await fetch('/api/technicians')
          if (!response.ok) {
            throw new Error(`Failed to load technicians: ${response.statusText}`)
          }
          const data = await response.json()
          if (Array.isArray(data)) {
            set((state) => ({
              technicians: data,
              loading: { ...state.loading, technicians: false },
              cache: { ...state.cache, techniciansLastFetched: Date.now() },
            }))
          }
        } catch (error) {
          console.error('[Store] Error loading technicians:', error)
          set((state) => ({
            loading: { ...state.loading, technicians: false },
          }))
        }
      },

      loadTemplatesFromSupabase: async (force = false) => {
        if (!force && !isCacheStale(get().cache.templatesLastFetched)) {
          return
        }
        
        try {
          const response = await fetch('/api/templates')
          if (!response.ok) {
            return
          }
          const data = await response.json()
          if (Array.isArray(data) && data.length > 0) {
            set((state) => ({
              templates: data,
              cache: { ...state.cache, templatesLastFetched: Date.now() },
            }))
          }
        } catch {
          // Keep default templates on error
        }
      },
      
      // Refresh user profile from Supabase
      refreshUserProfile: async () => {
        try {
          console.log('[Store] Refreshing user profile...')
          const response = await fetch('/api/auth/user-profile')
          if (!response.ok) {
            console.error('[Store] Failed to refresh profile:', response.status)
            return
          }
          const profile = await response.json()
          
          if (profile.id === 'demo') {
            return
          }
          
          const admin: Admin = {
            id: profile.id,
            name: profile.full_name || profile.email?.split('@')[0] || 'User',
            email: profile.email || '',
            phone: profile.phone || '',
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
        if (get().isInitialized || get().loading.initializing) {
          console.log('[Store] Already initialized or initializing, skipping...')
          return
        }
        
        set((state) => ({
          loading: { ...state.loading, initializing: true },
        }))
        
        try {
          const response = await fetch('/api/auth/user-profile')
          if (!response.ok) {
            set((state) => ({
              loading: { ...state.loading, initializing: false },
            }))
            return
          }
          const profile = await response.json()
          
          if (profile.id === 'demo') {
            set((state) => ({
              loading: { ...state.loading, initializing: false },
            }))
            return
          }
          
          const admin: Admin = {
            id: profile.id,
            name: profile.full_name || profile.email?.split('@')[0] || 'User',
            email: profile.email || '',
            phone: profile.phone || '',
            role: 'admin',
            is_active: true,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
            avatar_url: null,
          }
          
          set({ currentAdmin: admin, isAdminAuthenticated: true })
          
          const tradeType = profile.trade_type || 'generic'
          const tradeTemplates = getTradeSpecificTemplates(tradeType)
          set({ templates: tradeTemplates })
          
          if (profile.company_name || profile.company_phone || profile.trade_type) {
            set((state) => ({
              settings: {
                ...state.settings,
                company_name: profile.company_name || state.settings.company_name,
                company_phone: profile.company_phone || state.settings.company_phone,
                trade_type: profile.trade_type || state.settings.trade_type,
              }
            }))
          }
          
          try {
            const settingsResponse = await fetch('/api/settings')
            if (settingsResponse.ok) {
              const settingsData = await settingsResponse.json()
              if (settingsData && settingsData.company_name) {
                set((state) => ({
                  settings: settingsData,
                  cache: { ...state.cache, settingsLastFetched: Date.now() },
                }))
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
          
          set((state) => ({
            isInitialized: true,
            loading: { ...state.loading, initializing: false },
          }))
          console.log('[Store] Initialization complete')
        } catch {
          set((state) => ({
            loading: { ...state.loading, initializing: false },
          }))
        }
      },
      
      // Reset store and clear localStorage
      resetStore: () => {
        // Clear persisted storage
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('dispatchly-storage')
          } catch (e) {
            console.error('[Store] Failed to clear localStorage:', e)
          }
        }
        
        // Reset all state to initial values
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
          loading: {
            jobs: false,
            technicians: false,
            templates: false,
            settings: false,
            deletingJob: {},
            deletingTechnician: {},
            creatingJob: false,
            creatingTechnician: false,
            initializing: false,
          },
          error: {
            code: null,
            message: null,
            timestamp: null,
            recoveredAt: null,
          },
          cache: {
            jobsLastFetched: null,
            techniciansLastFetched: null,
            templatesLastFetched: null,
            settingsLastFetched: null,
          },
        })
      },
    }),
    {
      name: 'dispatchly-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist non-sensitive data
      partialize: (state) => ({
        // Don't persist: currentAdmin, isAdminAuthenticated, cache
        settings: state.settings,
        templates: state.templates,
        notificationPreferences: state.notificationPreferences,
        // Don't persist data that should come from server
        // jobs: state.jobs,
        // technicians: state.technicians,
      }),
      // Handle storage errors
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[Store] Failed to rehydrate storage:', error)
        }
      },
    }
  )
)

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getTechnicianById = (technicians: Technician[], id: string | null) => {
  if (!id) return null
  return technicians.find((t) => t.id === id) || null
}

export const getTechniciansByIds = (technicians: Technician[], ids: string[] | null) => {
  if (!ids || ids.length === 0) return []
  return technicians.filter((t) => ids.includes(t.id))
}

export const getTechnicianJobs = (jobs: Job[], techId: string) => {
  return jobs.filter((j) => j.assigned_tech_ids?.includes(techId) ?? false)
}

export const getAvailableJobs = (jobs: Job[]) => {
  return jobs.filter((j) => j.status === 'available')
}

export const getPhotosByJobId = (photos: JobPhoto[], jobId: string) => {
  return photos.filter((p) => p.job_id === jobId)
}

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

export const maskPhoneNumber = (phone: string) => {
  const match = phone.match(/^\((\d{3})\)/)
  if (match) {
    return `(${match[1]}) ***-****`
  }
  return '***-***-****'
}

// ============================================
// HOOKS FOR DERIVED STATE
// ============================================

export function useBrandColor() {
  return useStore((state) => state.settings.primary_color || '#3b82f6')
}

export function useBranding() {
  return useStore((state) => ({
    primaryColor: state.settings.primary_color || '#3b82f6',
    logoUrl: state.settings.logo_url,
    tagline: state.settings.tagline,
    companyName: state.settings.company_name,
  }))
}

export function useLoadingState(key: keyof LoadingState) {
  return useStore((state) => state.loading[key])
}

export function useError() {
  return useStore((state) => state.error)
}

export function useIsStale(dataType: keyof CacheState) {
  return useStore((state) => isCacheStale(state.cache[dataType]))
}