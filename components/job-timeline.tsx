"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import {
  Clock,
  MapPin,
  Wrench,
  CheckCircle2,
  MessageSquare,
  Smartphone,
  User,
  Camera,
  AlertCircle
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

interface JobUpdate {
  id: string
  created_at: string
  status: string
  notes: string | null
  source: "web" | "sms" | "system"
  technician_name?: string
  photos?: { id: string; url: string; thumbnail_url?: string }[]
}

interface SMSLog {
  id: string
  created_at: string
  body: string
  direction: "inbound" | "outbound"
  parsed_keyword?: string
  parsed_result?: string
  message_type?: string
  from_number: string
  to_number: string
}

interface JobTimelineProps {
  jobId: string
}

export function JobTimeline({ jobId }: JobTimelineProps) {
  const [updates, setUpdates] = useState<JobUpdate[]>([])
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchTimelineData()
  }, [jobId])

  async function fetchTimelineData() {
    try {
      setLoading(true)

      // Fetch job updates
      const { data: updatesData, error: updatesError } = await supabase
        .from("updates")
        .select(`
          id,
          created_at,
          status,
          notes,
          technicians:technician_id (name)
        `)
        .eq("job_id", jobId)
        .order("created_at", { ascending: false })

      if (updatesError) throw updatesError

      // Fetch SMS logs for this job
      const { data: smsData, error: smsError } = await supabase
        .from("sms_logs")
        .select("*")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false })

      if (smsError) throw smsError

      // Process updates to mark SMS-sourced ones
      const processedUpdates: JobUpdate[] = (updatesData || []).map((update: any) => {
        // Check if this update was triggered by SMS
        const matchingSms = smsData?.find(
          (sms: SMSLog) =>
            sms.parsed_result?.includes("status_update") &&
            new Date(sms.created_at).getTime() - new Date(update.created_at).getTime() < 5000 // Within 5 seconds
        )

        return {
          id: update.id,
          created_at: update.created_at,
          status: update.status,
          notes: update.notes,
          source: matchingSms ? "sms" : "web",
          technician_name: update.technicians?.name,
        }
      })

      setUpdates(processedUpdates)
      setSmsLogs(smsData || [])
    } catch (error) {
      console.error("Error fetching timeline:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "enroute":
        return <MapPin className="h-5 w-5 text-yellow-500" />
      case "working":
        return <Wrench className="h-5 w-5 text-orange-500" />
      case "complete":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      scheduled: "Scheduled",
      enroute: "En Route",
      working: "Working",
      complete: "Complete",
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: "bg-blue-100 text-blue-700 border-blue-200",
      enroute: "bg-yellow-100 text-yellow-700 border-yellow-200",
      working: "bg-orange-100 text-orange-700 border-orange-200",
      complete: "bg-green-100 text-green-700 border-green-200",
    }
    return colors[status] || "bg-gray-100 text-gray-700"
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "sms":
        return <Smartphone className="h-4 w-4 text-blue-500" />
      case "web":
        return <User className="h-4 w-4 text-green-500" />
      case "system":
        return <AlertCircle className="h-4 w-4 text-purple-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      sms: "Updated via SMS",
      web: "Updated via Web",
      system: "System Update",
    }
    return labels[source] || source
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (updates.length === 0 && smsLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No updates yet</p>
            <p className="text-sm mt-2">Updates will appear here when the technician changes status</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Combine updates and SMS logs into a single timeline
  const timeline = [
    ...updates.map((u) => ({
      type: "update" as const,
      id: u.id,
      date: u.created_at,
      data: u,
    })),
    ...smsLogs
      .filter((sms) => sms.direction === "inbound" && !sms.parsed_result?.includes("status_update"))
      .map((sms) => ({
        type: "sms" as const,
        id: sms.id,
        date: sms.created_at,
        data: sms,
      })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Job Timeline</span>
          <Badge variant="outline" className="font-normal">
            {updates.length} update{updates.length !== 1 ? "s" : ""}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

          {timeline.map((item, index) => (
            <div key={`${item.type}-${item.id}`} className="relative flex gap-4">
              {/* Icon */}
              <div className="relative z-10 flex-shrink-0">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    item.type === "update"
                      ? getStatusColor(item.data.status)
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  {item.type === "update"
                    ? getStatusIcon(item.data.status)
                    : getSourceIcon("sms")}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                {item.type === "update" ? (
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{getStatusLabel(item.data.status)}</span>
                        {item.data.source === "sms" && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-700 hover:bg-blue-100"
                          >
                            <Smartphone className="h-3 w-3 mr-1" />
                            SMS
                          </Badge>
                        )}
                      </div>
                      <time className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                      </time>
                    </div>

                    {/* Time detail */}
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(item.date), "MMM d, yyyy 'at' h:mm a")}
                    </p>

                    {/* Notes */}
                    {item.data.notes && (
                      <div className="mt-2 p-3 bg-muted rounded-lg text-sm">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <span>{item.data.notes}</span>
                        </div>
                      </div>
                    )}

                    {/* Source indicator */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      {getSourceIcon(item.data.source)}
                      <span>{getSourceLabel(item.data.source)}</span>
                      {item.data.technician_name && (
                        <>
                          <span>•</span>
                          <span>by {item.data.technician_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* SMS Note */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Text Message</span>
                        <Badge variant="outline" className="text-xs">
                          {item.data.parsed_keyword || "Note"}
                        </Badge>
                      </div>
                      <time className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                      </time>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {format(new Date(item.date), "MMM d, yyyy 'at' h:mm a")}
                    </p>

                    <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 mt-0.5 text-blue-500" />
                        <span className="italic">"{item.data.body}"</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <Smartphone className="h-4 w-4 text-blue-500" />
                      <span>Received via SMS</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* SMS Quick Help */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Technician SMS Commands
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            Technicians can text these keywords to update job status:
          </p>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline">E</Badge>
              <span className="text-muted-foreground">En Route</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">W</Badge>
              <span className="text-muted-foreground">Working</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">C</Badge>
              <span className="text-muted-foreground">Complete</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
