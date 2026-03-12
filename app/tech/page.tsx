'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Clock,
  Camera,
  Truck,
  Wrench,
  CheckCircle,
  Loader2,
  AlertCircle,
  LogOut,
} from 'lucide-react'
import { PhotoUpload } from '@/components/photo-upload'
import type { Job, JobStatus } from '@/lib/types'

interface Technician {
  id: string
  name: string
  email: string
  phone: string
}

const statusConfig: Record<JobStatus, { label: string; icon: React.ElementType; className: string }> = {
  scheduled: { label: 'Scheduled', icon: Clock, className: 'bg-blue-100 text-blue-800' },
  en_route: { label: 'En Route', icon: Truck, className: 'bg-yellow-100 text-yellow-800' },
  working: { label: 'Working', icon: Wrench, className: 'bg-orange-100 text-orange-800' },
  complete: { label: 'Complete', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
}

const statusOrder: JobStatus[] = ['scheduled', 'en_route', 'working', 'complete']

export default function TechnicianPortal() {
  const router = useRouter()
  const [technician, setTechnician] = useState<Technician | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null)
  const [showPhotoUpload, setShowPhotoUpload] = useState<string | null>(null)
  const [uploadedPhotos, setUploadedPhotos] = useState<Record<string, string[]>>({})

  useEffect(() => {
    loadTechnicianData()
  }, [])

  async function loadTechnicianData() {
    try {
      const response = await fetch('/api/auth/user-role')
      const data = await response.json()

      if (data.role !== 'technician' || !data.user?.technician) {
        setError('You are not authorized to access this page')
        setLoading(false)
        return
      }

      setTechnician(data.user.technician)

      // Fetch assigned jobs
      const jobsResponse = await fetch(`/api/technicians/${data.user.technician.id}/jobs`)
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json()
        setJobs(jobsData.jobs || [])
      }
    } catch (err) {
      console.error('Error loading technician data:', err)
      setError('Failed to load your information')
    } finally {
      setLoading(false)
    }
  }

  async function updateJobStatus(jobId: string, newStatus: JobStatus) {
    setUpdatingJobId(jobId)
    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setJobs((prev) =>
          prev.map((job) =>
            job.id === jobId
              ? { ...job, status: newStatus, updated_at: new Date().toISOString() }
              : job
          )
        )
      }
    } catch (err) {
      console.error('Error updating job status:', err)
    } finally {
      setUpdatingJobId(null)
    }
  }

  async function sendUpdate(jobId: string) {
    setUpdatingJobId(jobId)
    try {
      const job = jobs.find((j) => j.id === jobId)
      if (!job) return

      const photos = uploadedPhotos[jobId] || []

      const response = await fetch(`/api/jobs/${jobId}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: job.status,
          photos,
          send_sms: true,
        }),
      })

      if (response.ok) {
        setUploadedPhotos((prev) => ({ ...prev, [jobId]: [] }))
        alert('Update sent to customer!')
      }
    } catch (err) {
      console.error('Error sending update:', err)
      alert('Failed to send update')
    } finally {
      setUpdatingJobId(null)
    }
  }

  function getNextStatus(currentStatus: JobStatus): JobStatus | null {
    const currentIndex = statusOrder.indexOf(currentStatus)
    if (currentIndex < statusOrder.length - 1) {
      return statusOrder[currentIndex + 1]
    }
    return null
  }

  function handlePhotosUploaded(jobId: string, urls: string[]) {
    setUploadedPhotos((prev) => ({
      ...prev,
      [jobId]: [...(prev[jobId] || []), ...urls],
    }))
    setShowPhotoUpload(null)
  }

  function handleLogout() {
    localStorage.removeItem('tech_token')
    router.push('/tech')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleLogout} className="w-full">
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Welcome back,</p>
            <h1 className="text-lg font-semibold">{technician?.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
              {jobs.filter((j) => j.status !== 'complete').length} Active Jobs
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Job List */}
      <main className="max-w-6xl mx-auto p-4 space-y-4 pb-20">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No jobs assigned for today</p>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => {
            const StatusIcon = statusConfig[job.status].icon
            const nextStatus = getNextStatus(job.status)
            const jobPhotos = uploadedPhotos[job.id] || []

            return (
              <Card key={job.id} className="overflow-hidden">
                <CardHeader className="pb-3 bg-muted/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{job.customer_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{job.job_type}</p>
                    </div>
                    <Badge className={statusConfig[job.status].className}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig[job.status].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  {/* Address */}
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(job.customer_address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  >
                    <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-sm">{job.customer_address}</span>
                  </a>

                  {/* Time */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(job.scheduled_time).toLocaleString()}
                    </span>
                  </div>

                  {/* Notes */}
                  {job.notes && (
                    <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                      {job.notes}
                    </p>
                  )}

                  {/* Uploaded Photos Preview */}
                  {jobPhotos.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {jobPhotos.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Photo ${idx + 1}`}
                          className="h-16 w-16 rounded object-cover shrink-0"
                        />
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {/* Camera Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setShowPhotoUpload(job.id)}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Add Photos
                    </Button>

                    {/* Status Update Button */}
                    {nextStatus && (
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={updatingJobId === job.id}
                        onClick={() => updateJobStatus(job.id, nextStatus)}
                      >
                        {updatingJobId === job.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <>
                            {nextStatus === 'en_route' && <Truck className="h-4 w-4 mr-2" />}
                            {nextStatus === 'working' && <Wrench className="h-4 w-4 mr-2" />}
                            {nextStatus === 'complete' && <CheckCircle className="h-4 w-4 mr-2" />}
                          </>
                        )}
                        {nextStatus === 'en_route' && 'Start Route'}
                        {nextStatus === 'working' && 'Arrived'}
                        {nextStatus === 'complete' && 'Complete'}
                      </Button>
                    )}
                  </div>

                  {/* Send Update Button */}
                  <Button
                    variant="secondary"
                    className="w-full"
                    disabled={updatingJobId === job.id}
                    onClick={() => sendUpdate(job.id)}
                  >
                    Send Update to Customer
                  </Button>
                </CardContent>
              </Card>
            )
          })
        )}
      </main>

      {/* Photo Upload Modal */}
      {showPhotoUpload && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="bg-background w-full rounded-t-xl p-4 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Add Photos</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowPhotoUpload(null)}>
                Cancel
              </Button>
            </div>
            <PhotoUpload
              jobId={showPhotoUpload}
              onUploadComplete={(urls) => handlePhotosUploaded(showPhotoUpload, urls)}
              maxPhotos={5}
            />
          </div>
        </div>
      )}
    </div>
  )
}
