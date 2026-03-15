'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/database.types'

type Job = Database['public']['Tables']['jobs']['Row']

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchJobs()
  }, [])

  async function fetchJobs() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setJobs(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  async function createJob(jobData: Omit<Job, 'id' | 'created_at' | 'updated_at' | 'company_id' | 'status'>) {
    try {
      // Get the user's company
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!company) throw new Error('No company found')

      const { data, error } = await supabase
        .from('jobs')
        .insert({
          ...jobData,
          company_id: company.id,
          status: 'scheduled',
        })
        .select()
        .single()

      if (error) throw error
      setJobs(prev => [data, ...prev])
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create job')
    }
  }

  async function updateJobStatus(jobId: string, newStatus: Job['status']) {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId)

      if (error) throw error
      
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      ))
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update job status')
    }
  }

  async function deleteJob(jobId: string) {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)

      if (error) throw error
      setJobs(prev => prev.filter(job => job.id !== jobId))
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete job')
    }
  }

  return {
    jobs,
    loading,
    error,
    fetchJobs,
    createJob,
    updateJobStatus,
    deleteJob,
  }
}
