"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { JobTimeline } from "@/components/job-timeline"
import { JobNotes } from "@/components/job-notes"
import { SmsConversation } from "@/components/sms-conversation"
import { PhotoUpload } from "@/components/photo-upload"
import { CustomerLinkShare } from "@/components/customer-link-share"
import { useStore, getTechnicianById } from "@/lib/store"
import { toast } from "sonner"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Edit3,
  Trash2,
  PauseCircle,
  MessageSquare,
  Image,
  History,
  StickyNote
} from "lucide-react"
import Link from "next/link"
import type { JobStatus } from "@/lib/types"

const statusConfig: Record<JobStatus, { label: string; className: string; icon: React.ElementType }> = {
  available: { label: "Available", className: "bg-blue-100 text-blue-800", icon: Briefcase },
  scheduled: { label: "Scheduled", className: "bg-status-scheduled text-foreground", icon: Calendar },
  en_route: { label: "En Route", className: "bg-status-enroute text-primary-foreground", icon: Clock },
  working: { label: "Working", className: "bg-status-working text-foreground", icon: CheckCircle2 },
  on_hold: { label: "On Hold", className: "bg-amber-100 text-amber-800", icon: PauseCircle },
  complete: { label: "Complete", className: "bg-status-complete text-primary-foreground", icon: CheckCircle2 },
}

interface JobDetailPageProps {
  params: Promise<{ id: string }>
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { 
    jobs, 
    technicians, 
    smsLogs, 
    loadJobsFromSupabase, 
    loadTechniciansFromSupabase,
    updateJobStatus,
    updateJob,
    deleteJob,
    loadSmsLogs
  } = useStore()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showOnHoldDialog, setShowOnHoldDialog] = useState(false)
  const [onHoldReason, setOnHoldReason] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadJobsFromSupabase(), 
        loadTechniciansFromSupabase(),
        loadSmsLogs()
      ])
      setIsLoading(false)
    }
    loadData()
  }, [loadJobsFromSupabase, loadTechniciansFromSupabase, loadSmsLogs])

  const job = jobs.find((j) => j.id === id)
  const jobSmsLogs = smsLogs.filter((log) => log.job_id === id)
  const assignedTechs = job?.assigned_tech_ids
    ? technicians.filter((t) => job.assigned_tech_ids?.includes(t.id))
    : []

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
            <p className="text-muted-foreground mb-4">The job you&apos;re looking for doesn&apos;t exist</p>
            <Link href="/jobs">
              <Button>Back to Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const status = statusConfig[job.status]
  const StatusIcon = status.icon
  const scheduledDate = new Date(job.scheduled_time)

  const handleStatusChange = async (newStatus: JobStatus) => {
    if (newStatus === "on_hold") {
      setShowOnHoldDialog(true)
      return
    }
    await updateJobStatus(id, newStatus)
    toast.success(`Status updated to ${statusConfig[newStatus].label}`)
  }

  const handleOnHoldSubmit = async () => {
    if (!onHoldReason.trim()) {
      toast.error("Please provide a reason for putting the job on hold")
      return
    }
    await updateJob(id, { status: "on_hold", on_hold_reason: onHoldReason })
    setShowOnHoldDialog(false)
    setOnHoldReason("")
    toast.success("Job put on hold")
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteJob(id)
      toast.success("Job deleted successfully")
      router.push("/jobs")
    } catch (error) {
      console.error("[JobDetailPage] Error deleting job:", error)
      toast.error("Failed to delete job")
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/jobs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{job.customer_name}</h1>
              <Badge className={status.className}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">{job.job_type}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/jobs/${id}/edit`}>
            <Button variant="outline">
              <Edit3 className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="photos" className="hidden lg:inline-flex">Photos</TabsTrigger>
          <TabsTrigger value="customer" className="hidden lg:inline-flex">Customer Link</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Info */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Update */}
                <div className="space-y-2">
                  <Label>Update Status</Label>
                  <Select value={job.status} onValueChange={(v) => handleStatusChange(v as JobStatus)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(statusConfig) as JobStatus[]).map((statusKey) => (
                        <SelectItem key={statusKey} value={statusKey}>
                          {statusConfig[statusKey].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {job.status === "on_hold" && job.on_hold_reason && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <p className="text-sm text-amber-800">
                        <span className="font-medium">On Hold Reason:</span> {job.on_hold_reason}
                      </p>
                    </div>
                  )}
                </div>

                {/* Info Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Scheduled</p>
                      <p className="text-sm text-muted-foreground">
                        {scheduledDate.toLocaleDateString()} at {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{job.customer_phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{job.customer_address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Assigned Technicians</p>
                      <p className="text-sm text-muted-foreground">
                        {assignedTechs.length > 0
                          ? assignedTechs.map((t) => t.name).join(", ")
                          : "Unassigned"}
                      </p>
                    </div>
                  </div>
                </div>

                {job.notes && (
                  <div className="pt-4 border-t">
                    <p className="font-medium mb-2">Notes</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("messages")}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("photos")}
                  >
                    <Image className="mr-2 h-4 w-4" />
                    Upload Photos
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("customer")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Customer Link
                  </Button>
                </CardContent>
              </Card>

              {/* Job Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Messages</span>
                    <span className="font-medium">{jobSmsLogs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-medium">
                      {new Date(job.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Job Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <JobTimeline jobId={id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages">
          <SmsConversation jobId={id} recipientPhone={job.customer_phone} />
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="h-5 w-5" />
                Job Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <JobNotes jobId={id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoUpload jobId={id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Link Tab */}
        <TabsContent value="customer">
          <CustomerLinkShare jobId={id} />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Job"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* On Hold Reason Dialog */}
      <Dialog open={showOnHoldDialog} onOpenChange={setShowOnHoldDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Put Job On Hold</DialogTitle>
            <DialogDescription>
              Please provide a reason for putting this job on hold.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                placeholder="e.g., Waiting for parts, Customer rescheduled..."
                value={onHoldReason}
                onChange={(e) => setOnHoldReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOnHoldDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleOnHoldSubmit}>
              Put On Hold
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
