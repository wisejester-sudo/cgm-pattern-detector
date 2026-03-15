"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { JobCard } from "@/components/job-card"
import { CreateJobModal } from "@/components/create-job-modal"
import { useStore } from "@/lib/store"
import type { JobStatus } from "@/lib/types"

const statusLabels: Record<JobStatus, string> = {
  scheduled: "Scheduled",
  en_route: "En Route",
  working: "Working",
  complete: "Complete",
}

export default function JobsPage() {
  const { jobs, technicians, templates, settings, loadJobsFromSupabase } = useStore()

  // Load jobs from Supabase on mount
  useEffect(() => {
    loadJobsFromSupabase()
  }, [loadJobsFromSupabase])

  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (response.ok) {
        const data = await response.json()
        await loadJobsFromSupabase()
        toast.success(`Status updated to ${statusLabels[newStatus]}`)
        
        // Show SMS status if applicable
        if (data.sms) {
          if (data.sms.success) {
            toast.success('Customer notified via SMS')
          } else {
            console.error('[Dashboard] SMS failed:', data.sms.error)
            toast.error('Status updated but SMS failed to send')
          }
        }
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      console.error("Error updating job status:", error)
      toast.error('Failed to update status')
    }
  }

  // Sort jobs: active jobs first, then by scheduled time
  const sortedJobs = [...jobs].sort((a, b) => {
    const statusOrder: Record<JobStatus, number> = {
      working: 0,
      en_route: 1,
      scheduled: 2,
      complete: 3,
    }
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status]
    }
    return new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Jobs</h1>
          <p className="text-muted-foreground">
            Manage and track all your service jobs
          </p>
        </div>
        <CreateJobModal technicians={technicians} />
      </div>

      {/* Job Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            technician={getTechnicianById(technicians, job.assigned_tech_id)}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-2">No jobs yet</p>
          <p className="text-sm text-muted-foreground">
            Create your first job to get started
          </p>
        </div>
      )}
    </div>
  )
}
