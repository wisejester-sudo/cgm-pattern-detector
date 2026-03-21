"use client"

import { use, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, MapPin, Clock, User, Wrench, CheckCircle2, Truck, Calendar, Loader2, Image as ImageIcon } from "lucide-react"
import { Logo } from "@/components/logo"
import Image from "next/image"
import type { JobStatus } from "@/lib/types"

const statusConfig: Record<JobStatus, { label: string; className: string; icon: React.ElementType; description: string }> = {
  available: {
    label: "Confirmed",
    className: "bg-blue-100 text-blue-800",
    icon: Calendar,
    description: "Your appointment is confirmed and waiting to be assigned.",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-status-scheduled text-foreground",
    icon: Calendar,
    description: "Your technician is assigned and will arrive at the scheduled time.",
  },
  en_route: {
    label: "On the Way",
    className: "bg-status-enroute text-primary-foreground",
    icon: Truck,
    description: "Your technician is on the way to your location.",
  },
  working: {
    label: "In Progress",
    className: "bg-status-working text-foreground",
    icon: Wrench,
    description: "Your technician has arrived and is working on the job.",
  },
  on_hold: {
    label: "On Hold",
    className: "bg-amber-100 text-amber-800",
    icon: Clock,
    description: "This job is temporarily on hold. We'll update you when work resumes.",
  },
  complete: {
    label: "Completed",
    className: "bg-status-complete text-primary-foreground",
    icon: CheckCircle2,
    description: "The job has been completed. Thank you for choosing us!",
  },
}

const statusSteps: JobStatus[] = ["scheduled", "en_route", "working", "complete"]

interface Job {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  job_type: string
  status: JobStatus
  scheduled_time: string
  assigned_tech_ids: string[] | null
}

interface Technician {
  id: string
  name: string
  phone: string
}

interface Photo {
  id: string
  photo_url: string
  caption: string | null
  uploaded_at: string
}

interface Settings {
  company_name: string
  company_phone: string
}

export default function CustomerJobPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = use(params)
  const [job, setJob] = useState<Job | null>(null)
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [settings, setSettings] = useState<Settings>({ company_name: "", company_phone: "" })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJobData()
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchJobData, 30000)
    return () => clearInterval(interval)
  }, [token])

  const fetchJobData = async () => {
    try {
      const response = await fetch(`/api/public/jobs/by-token/${token}`)
      if (!response.ok) {
        if (response.status === 410) {
          throw new Error("This link has expired. Please contact the company for a new link.")
        }
        throw new Error("Invalid or expired link")
      }
      const data = await response.json()
      setJob(data.job)
      setTechnicians(data.technicians || [])
      setPhotos(data.photos || [])
      setSettings(data.settings || { company_name: "", company_phone: "" })
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load job details")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your job details...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-8">
            <p className="text-destructive mb-2">{error || "Link expired"}</p>
            <p className="text-sm text-muted-foreground">
              This link may have expired or is invalid.
            </p>
            {settings.company_phone && (
              <p className="text-sm text-muted-foreground mt-4">
                Need help? Call: <a href={`tel:${settings.company_phone}`} className="text-primary">{settings.company_phone}</a>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const assignedTechnician = technicians[0]
  const scheduledDate = new Date(job.scheduled_time)
  const currentStatus = statusConfig[job.status]
  const currentStepIndex = statusSteps.indexOf(job.status)

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-sidebar text-sidebar-foreground py-6 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Logo size="sm" variant="white" showText={false} />
            <span className="font-semibold text-lg">{settings.company_name || "Dispatchly"}</span>
          </div>
          <p className="text-sidebar-muted text-sm">Job Status</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto p-4 -mt-4 space-y-4">
        {/* Status Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${currentStatus.className}`}>
                <currentStatus.icon className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold mb-1">{currentStatus.label}</h2>
              <p className="text-muted-foreground text-sm px-4">{currentStatus.description}</p>
            </div>

            {/* Progress Steps */}
            {job.status !== "available" && job.status !== "on_hold" && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  {statusSteps.map((step, index) => {
                    const stepConfig = statusConfig[step]
                    const isActive = index <= currentStepIndex
                    const isCurrent = index === currentStepIndex

                    return (
                      <div key={step} className="flex flex-col items-center flex-1">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mb-1 ${
                            isCurrent
                              ? stepConfig.className
                              : isActive
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span className={`text-xs ${isCurrent ? "font-medium" : "text-muted-foreground"}`}>
                          {stepConfig.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className="relative h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-primary rounded-full transition-all"
                    style={{
                      width: `${Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Job Details */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{job.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{job.job_type}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm">{job.customer_address}</p>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm">
                  {scheduledDate.toLocaleDateString()} at{" "}
                  {scheduledDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </p>
              </div>

              {assignedTechnician && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{assignedTechnician.name}</p>
                    {assignedTechnician.phone && (
                      <a
                        href={`tel:${assignedTechnician.phone}`}
                        className="text-sm text-primary flex items-center gap-1"
                      >
                        <Phone className="h-3 w-3" />
                        {assignedTechnician.phone}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Photos Section */}
        {photos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Job Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative aspect-square">
                    <Image
                      src={photo.photo_url}
                      alt={photo.caption || "Job photo"}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Card */}
        {settings.company_phone && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Contact us if you have any questions about your appointment.
              </p>
              <a 
                href={`tel:${settings.company_phone}`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium"
              >
                <Phone className="h-4 w-4" />
                Call {settings.company_name}
              </a>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          This page updates automatically. Last updated: {new Date().toLocaleTimeString()}
        </p>
        <p className="text-center text-xs text-muted-foreground">
          Powered by Dispatchly
        </p>
      </main>
    </div>
  )
}
