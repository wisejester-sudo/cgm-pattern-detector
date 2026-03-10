"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Phone, MapPin, ChevronDown, Clock, User } from "lucide-react"
import Link from "next/link"
import type { Job, JobStatus, Technician } from "@/lib/types"

const statusConfig: Record<JobStatus, { label: string; className: string }> = {
  scheduled: {
    label: "Scheduled",
    className: "bg-status-scheduled text-foreground",
  },
  en_route: {
    label: "En Route",
    className: "bg-status-enroute text-primary-foreground",
  },
  working: {
    label: "Working",
    className: "bg-status-working text-foreground",
  },
  complete: {
    label: "Complete",
    className: "bg-status-complete text-primary-foreground",
  },
}

interface JobCardProps {
  job: Job
  technician?: Technician | null
  onStatusChange?: (jobId: string, newStatus: JobStatus) => void
}

export function JobCard({ job, technician, onStatusChange }: JobCardProps) {
  const status = statusConfig[job.status]
  const scheduledDate = new Date(job.scheduled_time)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Header with name and status */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground">{job.customer_name}</h3>
              <p className="text-sm text-muted-foreground">{job.job_type}</p>
            </div>
            <Badge className={status.className}>{status.label}</Badge>
          </div>

          {/* Contact info */}
          <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{job.customer_phone}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              <span className="line-clamp-2">{job.customer_address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                {scheduledDate.toLocaleDateString()} at{" "}
                {scheduledDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            {technician && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{technician.name}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Link href={`/jobs/${job.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm">
                  Status
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(Object.keys(statusConfig) as JobStatus[]).map((statusKey) => (
                  <DropdownMenuItem
                    key={statusKey}
                    onClick={() => onStatusChange?.(job.id, statusKey)}
                    className={job.status === statusKey ? "bg-accent" : ""}
                  >
                    <span
                      className={`mr-2 h-2 w-2 rounded-full ${
                        statusKey === "scheduled"
                          ? "bg-status-scheduled"
                          : statusKey === "en_route"
                            ? "bg-status-enroute"
                            : statusKey === "working"
                              ? "bg-status-working"
                              : "bg-status-complete"
                      }`}
                    />
                    {statusConfig[statusKey].label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { statusConfig }
