"use client"

import { useEffect, useMemo, useCallback, useState } from "react"
import { toast } from "sonner"
import { JobCard } from "@/components/job-card"
import { CreateJobModal } from "@/components/create-job-modal"
import { EditJobModal } from "@/components/edit-job-modal"
import { useStore, getTechniciansByIds } from "@/lib/store"
import type { JobStatus, Job } from "@/lib/types"

const statusLabels: Record<JobStatus, string> = {
  available: "Available",
  scheduled: "Scheduled",
  en_route: "En Route",
  working: "Working",
  on_hold: "On Hold",
  complete: "Complete",
}

export default function JobsPage() {
  const { jobs, technicians, templates, settings, loadJobsFromSupabase } = useStore()
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Load jobs from Supabase on mount
  useEffect(() => {
    loadJobsFromSupabase()
  }, [loadJobsFromSupabase])

  // Handle opening edit modal
  const handleJobClick = useCallback((job: Job) => {
    setEditingJob(job)
    setIsEditModalOpen(true)
  }, [])

  // Memoize handler to prevent unnecessary re-renders
  const handleStatusChange = useCallback(async (jobId: string, newStatus: JobStatus) => {
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
  }, [loadJobsFromSupabase])

  // Sort jobs: active jobs first, then by scheduled time
  // Memoized to prevent recalculation on every render
  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      const statusOrder: Record<JobStatus, number> = {
        working: 0,
        en_route: 1,
        scheduled: 2,
        available: 3,
        on_hold: 4,
        complete: 5,
      }
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status]
      }
      return new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
    })
  }, [jobs])

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
            technicians={getTechniciansByIds(technicians, job.assigned_tech_ids)}
            onStatusChange={handleStatusChange}
            onClick={handleJobClick}
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

      {/* Edit Job Modal */}
      <EditJobModal
        job={editingJob}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onJobUpdated={() => {
          loadJobsFromSupabase()
          setEditingJob(null)
        }}
      />
    </div>
  )
}
