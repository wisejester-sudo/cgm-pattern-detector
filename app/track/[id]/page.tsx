"use client"

import { use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, MapPin, Clock, User, Wrench, Zap, CheckCircle2, Truck, Calendar } from "lucide-react"
import { useStore, getTechnicianById } from "@/lib/store"
import type { JobStatus } from "@/lib/types"

const statusConfig: Record<JobStatus, { label: string; className: string; icon: React.ElementType; description: string }> = {
  scheduled: {
    label: "Scheduled",
    className: "bg-status-scheduled text-foreground",
    icon: Calendar,
    description: "Your appointment is scheduled. We'll notify you when the technician is on the way.",
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
  complete: {
    label: "Completed",
    className: "bg-status-complete text-primary-foreground",
    icon: CheckCircle2,
    description: "The job has been completed. Thank you for choosing us!",
  },
}

const statusSteps: JobStatus[] = ["scheduled", "en_route", "working", "complete"]

export default function CustomerTrackPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { jobs, technicians, settings } = useStore()

  // For demo, use first job if ID is "demo"
  const job = id === "demo" ? jobs[0] : jobs.find((j) => j.id === id)

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-8">
            <p className="text-muted-foreground mb-2">Job not found</p>
            <p className="text-sm text-muted-foreground">
              Please check the tracking link and try again
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const technician = getTechnicianById(technicians, job.assigned_tech_ids?.[0] ?? null)
  const scheduledDate = new Date(job.scheduled_time)
  const currentStatus = statusConfig[job.status]
  const currentStepIndex = statusSteps.indexOf(job.status)

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-sidebar text-sidebar-foreground py-6 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sidebar-primary">
              <Zap className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">{settings.company_name}</span>
          </div>
          <p className="text-sidebar-muted text-sm">Job Tracking</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto p-4 -mt-4 space-y-4">
        {/* Status Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                job.status === "complete" ? "bg-status-complete/20" : "bg-primary/10"
              }`}>
                <currentStatus.icon className={`w-8 h-8 ${
                  job.status === "complete" ? "text-status-complete" : "text-primary"
                }`} />
              </div>
              <Badge className={`${currentStatus.className} text-base px-4 py-1 mb-2`}>
                {currentStatus.label}
              </Badge>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                {currentStatus.description}
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between px-4 mb-2">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex
                const isCurrent = index === currentStepIndex
                const StepIcon = statusConfig[step].icon
                return (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isCompleted
                          ? isCurrent
                            ? "bg-primary text-primary-foreground"
                            : "bg-status-complete text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs mt-1 ${
                      isCompleted ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {statusConfig[step].label.split(" ")[0]}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Progress Line */}
            <div className="relative mx-9 h-1 bg-muted rounded-full mb-6">
              <div
                className="absolute top-0 left-0 h-full bg-status-complete rounded-full transition-all duration-500"
                style={{
                  width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Appointment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted shrink-0">
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Service</p>
                <p className="font-medium">{job.job_type}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted shrink-0">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scheduled Time</p>
                <p className="font-medium">
                  {scheduledDate.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  at{" "}
                  {scheduledDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted shrink-0">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Service Address</p>
                <p className="font-medium">{job.customer_address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technician Info */}
        {technician && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Your Technician</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{technician.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Service Technician
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={`tel:${settings.company_phone.replace(/\D/g, "")}`}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">{settings.company_phone}</p>
                <p className="text-sm text-muted-foreground">Tap to call</p>
              </div>
            </a>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground py-4">
          Powered by Dispatchly
        </p>
      </main>
    </div>
  )
}
