"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Phone,
  MapPin,
  Clock,
  Camera,
  Navigation,
  X,
  Truck,
  Wrench,
  CheckCircle,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import {
  useStore,
  getTechnicianById,
  getPhotosByJobId,
  maskPhoneNumber,
} from "@/lib/store"
import type { JobStatus } from "@/lib/types"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"

// Simplified status config with clear technician-friendly labels
const statusConfig: Record<JobStatus, { 
  label: string
  className: string
  nextStatus?: JobStatus
  nextLabel?: string
  nextIcon?: React.ComponentType<{ className?: string }>
}> = {
  scheduled: {
    label: "Scheduled",
    className: "bg-status-scheduled text-foreground",
    nextStatus: "en_route",
    nextLabel: "I'm on my way",
    nextIcon: Truck,
  },
  en_route: {
    label: "En Route",
    className: "bg-status-enroute text-primary-foreground",
    nextStatus: "working",
    nextLabel: "I've arrived",
    nextIcon: Wrench,
  },
  working: {
    label: "Working",
    className: "bg-status-working text-foreground",
    nextStatus: "complete",
    nextLabel: "Job complete",
    nextIcon: CheckCircle,
  },
  complete: {
    label: "Complete",
    className: "bg-status-complete text-primary-foreground",
  },
}

export default function TechJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const {
    jobs,
    technicians,
    photos,
    templates,
    settings,
    currentTechId,
    updateJob,
    updateJobStatus,
    addPhoto,
    deletePhoto,
    addSmsLog,
  } = useStore()

  const [notes, setNotes] = useState("")
  const [smsSending, setSmsSending] = useState(false)

  const technician = getTechnicianById(technicians, currentTechId)
  const job = jobs.find((j) => j.id === id)
  const jobPhotos = getPhotosByJobId(photos, id)

  useEffect(() => {
    if (!currentTechId) {
      router.push("/tech")
    }
  }, [currentTechId, router])

  useEffect(() => {
    if (job) {
      setNotes(job.notes || "")
    }
  }, [job])

  if (!technician || !job) {
    return null
  }

  const scheduledDate = new Date(job.scheduled_time)
  const status = statusConfig[job.status]

  const handleStatusAdvance = async () => {
    if (!status.nextStatus) return

    setSmsSending(true)
    
    // Call API to update status and send SMS
    try {
      const response = await fetch(`/api/jobs/${job.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: status.nextStatus }),
      })
      
      if (response.ok) {
        const data = await response.json()
        updateJobStatus(job.id, status.nextStatus)
        
        // Log SMS status
        if (data.sms) {
          addSmsLog({
            job_id: job.id,
            recipient_phone: job.customer_phone,
            message_body: `Status updated to ${status.nextStatus}`,
            status: data.sms.success ? "sent" : "failed",
            message_sid: data.sms.messageId,
          })
          
          if (!data.sms.success) {
            console.error("[TechView] SMS failed:", data.sms.error)
          }
        }
      } else {
        console.error("[TechView] Failed to update status")
      }
    } catch (error) {
      console.error("[TechView] Error:", error)
    }
    
    setSmsSending(false)
  }

  const handleSaveNotes = () => {
    updateJob(job.id, { notes: notes || null })
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      addPhoto({
        job_id: job.id,
        photo_url: url,
        caption: null,
      })
    }
  }

  const handleOpenMaps = () => {
    const address = encodeURIComponent(job.customer_address)
    window.open(`https://maps.google.com/maps?q=${address}`, "_blank")
  }

  const handleCall = () => {
    window.open(`tel:${job.customer_phone.replace(/\D/g, "")}`, "_self")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-sidebar text-sidebar-foreground p-4">
        <div className="flex items-center gap-3">
          <Link href="/tech/jobs">
            <Button
              variant="ghost"
              size="icon"
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate">{job.customer_name}</h1>
            <p className="text-sm text-sidebar-muted">{job.job_type}</p>
          </div>
          <Badge className={status.className}>{status.label}</Badge>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 space-y-4 pb-24">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={handleCall} className="h-12">
            <Phone className="h-4 w-4 mr-2" />
            Call Customer
          </Button>
          <Button variant="outline" onClick={handleOpenMaps} className="h-12">
            <Navigation className="h-4 w-4 mr-2" />
            Navigate
          </Button>
        </div>

        {/* Job Info */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted shrink-0">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{job.customer_address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted shrink-0">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="font-medium">
                  {scheduledDate.toLocaleDateString()} at{" "}
                  {scheduledDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            {/* Phone - masked for technician view */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted shrink-0">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone (for navigation only)</p>
                <p className="font-medium text-muted-foreground">{maskPhoneNumber(job.customer_phone)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this job..."
                  rows={3}
                />
              </Field>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveNotes}
                disabled={notes === (job.notes || "")}
              >
                Save Notes
              </Button>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {jobPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <Image
                    src={photo.photo_url}
                    alt="Job photo"
                    width={100}
                    height={100}
                    className="rounded-lg object-cover w-[100px] h-[100px]"
                  />
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center w-[100px] h-[100px] border-2 border-dashed border-border rounded-lg cursor-pointer">
                <Camera className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Bottom Action Bar - Simplified status buttons for technicians */}
      {status.nextStatus && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          <Button
            className="w-full h-14 text-lg"
            onClick={handleStatusAdvance}
            disabled={smsSending}
          >
            {smsSending ? (
              "Sending notification..."
            ) : (
              <>
                {status.nextIcon && <status.nextIcon className="h-5 w-5 mr-2" />}
                {status.nextLabel}
              </>
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Customer will be notified automatically
          </p>
        </div>
      )}
    </div>
  )
}
