"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { JobCard } from "@/components/job-card"
import { CreateJobModal } from "@/components/create-job-modal"
import { useStore, getTechnicianById } from "@/lib/store"
import type { JobStatus } from "@/lib/types"
import { sendSMS, generatePhotoLink } from "@/lib/twilio"

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
        await loadJobsFromSupabase()
        toast.success(`Status updated to ${statusLabels[newStatus]}`)
        
        // Send SMS notification for certain status changes
        if (newStatus === 'en_route' || newStatus === 'complete') {
          const job = jobs.find(j => j.id === jobId)
          if (job) {
            const templateName = newStatus === 'en_route' ? 'En Route Notification' : 'Job Complete'
            const template = templates.find(t => t.name === templateName)
            
            if (template) {
              const tech = getTechnicianById(technicians, job.assigned_tech_id)
              const photoLink = generatePhotoLink(job.id)
              
              const messageBody = template.template_body
                .replace(/\{customer_name\}/g, job.customer_name)
                .replace(/\{tech_name\}/g, tech?.name || 'Your technician')
                .replace(/\{job_type\}/g, job.job_type)
                .replace(/\{address\}/g, job.customer_address)
                .replace(/\{company_name\}/g, settings.company_name)
                .replace(/\{company_phone\}/g, settings.company_phone)
                .replace(/\{eta\}/g, new Date(job.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
                .replace(/\{link\}/g, photoLink)
              
              const result = await sendSMS({
                to: job.customer_phone,
                body: messageBody,
              })
              
              if (result.success) {
                toast.success('Customer notified via SMS')
              } else {
                console.error('[Dashboard] Failed to send SMS:', result.error)
                toast.error('Status updated but SMS failed to send')
              }
            }
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
