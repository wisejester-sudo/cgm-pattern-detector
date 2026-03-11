"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Phone, 
  Clock, 
  Camera, 
  Truck, 
  Wrench, 
  CheckCircle,
  Loader2,
  AlertCircle
} from "lucide-react"
import { PhotoUpload } from "@/components/photo-upload"
import type { Job, JobStatus } from "@/lib/types"

interface Technician {
  id: string
  name: string
  email: string
  phone: string
}

interface TechSession {
  technician: Technician
  expires_at: string
}

const statusConfig: Record<JobStatus, { label: string; icon: React.ElementType; className: string }> = {
  scheduled: { label: "Scheduled", icon: Clock, className: "bg-blue-100 text-blue-800" },
  en_route: { label: "En Route", icon: Truck, className: "bg-yellow-100 text-yellow-800" },
  working: { label: "Working", icon: Wrench, className: "bg-orange-100 text-orange-800" },
  complete: { label: "Complete", icon: CheckCircle, className: "bg-green-100 text-green-800" },
}

const statusOrder: JobStatus[] = ["scheduled", "en_route", "working", "complete"]

export default function TechMobilePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const router = useRouter()
  const [session, setSession] = useState<TechSession | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null)
  const [showPhotoUpload, setShowPhotoUpload] = useState<string | null>(null)
  const [uploadedPhotos, setUploadedPhotos] = useState<Record<string, string[]>>({})

  useEffect(() => {
    validateToken()
  }, [token])

  async function validateToken() {
    try {
      const res = await fetch("/api/auth/validate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()

      if (!data.valid) {
        setError(data.error || "Invalid or expired link")
        setLoading(false)
        return
      }

      setSession({
        technician: data.technician,
        expires_at: data.expires_at,
      })

      // Store token in localStorage for session persistence
      localStorage.setItem("tech_token", token)

      // Fetch assigned jobs
      await fetchJobs(data.technician.id)
    } catch {
      setError("Failed to validate link")
    } finally {
      setLoading(false)
    }
  }

  async function fetchJobs(techId: string) {
    try {
      // For demo, use mock data. In production, fetch from API
      const mockJobs: Job[] = [
        {
          id: "1",
          customer_name: "John Smith",
          customer_phone: "(555) 123-4567",
          customer_address: "123 Oak Street, Austin, TX 78701",
          job_type: "AC Repair",
          status: "scheduled",
          scheduled_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          notes: "Customer reports AC not cooling properly",
          assigned_tech_id: techId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "2",
          customer_name: "Sarah Johnson",
          customer_phone: "(555) 234-5678",
          customer_address: "456 Maple Ave, Austin, TX 78702",
          job_type: "Furnace Maintenance",
          status: "en_route",
          scheduled_time: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
          notes: "Annual maintenance checkup",
          assigned_tech_id: techId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]
      setJobs(mockJobs)
    } catch {
      console.error("Failed to fetch jobs")
    }
  }

  async function updateJobStatus(jobId: string, newStatus: JobStatus) {
    setUpdatingJobId(jobId)
    try {
      // Update local state immediately for responsiveness
      setJobs(prev => 
        prev.map(job => 
          job.id === jobId ? { ...job, status: newStatus, updated_at: new Date().toISOString() } : job
        )
      )

      // In production, call API
      // await fetch(`/api/jobs/${jobId}/status`, {
      //   method: "PATCH",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ status: newStatus }),
      // })
    } catch {
      // Revert on error
      console.error("Failed to update status")
    } finally {
      setUpdatingJobId(null)
    }
  }

  async function sendUpdate(jobId: string) {
    setUpdatingJobId(jobId)
    try {
      const job = jobs.find(j => j.id === jobId)
      if (!job) return

      const photos = uploadedPhotos[jobId] || []

      // In production, call API to send SMS
      // await fetch(`/api/jobs/${jobId}/updates`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ 
      //     status: job.status,
      //     photos,
      //     send_sms: true 
      //   }),
      // })

      // Clear uploaded photos after sending
      setUploadedPhotos(prev => ({ ...prev, [jobId]: [] }))
      
      alert("Update sent to customer!")
    } catch {
      console.error("Failed to send update")
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
    setUploadedPhotos(prev => ({
      ...prev,
      [jobId]: [...(prev[jobId] || []), ...urls],
    }))
    setShowPhotoUpload(null)
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
            <h2 className="text-lg font-semibold mb-2">Link Invalid</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">
              Please request a new magic link from your dispatcher.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Welcome back,</p>
            <h1 className="text-lg font-semibold">{session?.technician.name}</h1>
          </div>
          <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
            {jobs.length} Jobs Today
          </Badge>
        </div>
      </header>

      {/* Job List */}
      <main className="p-4 space-y-4 pb-20">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
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
                <CardHeader className="pb-3">
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
                <CardContent className="space-y-4">
                  {/* Address */}
                  <a 
                    href={`https://maps.google.com/?q=${encodeURIComponent(job.customer_address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-sm">{job.customer_address}</span>
                  </a>

                  {/* Phone (masked) */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>(555) ***-****</span>
                  </div>

                  {/* Notes */}
                  {job.notes && (
                    <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
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
                            {nextStatus === "en_route" && <Truck className="h-4 w-4 mr-2" />}
                            {nextStatus === "working" && <Wrench className="h-4 w-4 mr-2" />}
                            {nextStatus === "complete" && <CheckCircle className="h-4 w-4 mr-2" />}
                          </>
                        )}
                        {nextStatus === "en_route" && "Start Route"}
                        {nextStatus === "working" && "Arrived"}
                        {nextStatus === "complete" && "Complete"}
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
