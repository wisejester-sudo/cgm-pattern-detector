"use client"

import { use, useState, useCallback, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeft,
  Phone,
  MapPin,
  Clock,
  Wrench,
  MessageSquare,
  User,
  Camera,
  Trash2,
  X,
  Download,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useStore, getTechniciansByIds, getPhotosByJobId, renderTemplate } from "@/lib/store"
import { EditJobModal } from "@/components/edit-job-modal"
import type { JobStatus } from "@/lib/types"
import { statusConfig } from "@/components/job-card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { JobTimeline } from "@/components/job-timeline"
import { SmsConversation } from "@/components/sms-conversation"

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = use(params)
  const {
    jobs,
    technicians,
    photos,
    templates,
    smsLogs,
    settings,
    updateJob,
    updateJobStatus,
    addPhoto,
    deletePhoto,
    deleteJob,
    addSmsLog,
    loadSmsLogsFromSupabase,
  } = useStore()

  const job = jobs.find((j) => j.id === id)
  const [smsSending, setSmsSending] = useState(false)
  const [smsSent, setSmsSent] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]?.id || "")
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState(job?.notes || "")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'messages' | 'photos' | 'notes'>('overview')

  // Load SMS logs when job loads
  useEffect(() => {
    if (id) {
      loadSmsLogsFromSupabase(id)
    }
  }, [id, loadSmsLogsFromSupabase])

  // Handle sending SMS
  const handleSendMessage = async (message: string) => {
    try {
      const response = await fetch(`/api/sms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: id,
          recipient_phone: job?.customer_phone,
          message_body: message,
          sender_name: settings?.company_name || "Business",
          sender_type: "admin",
        }),
      })

      if (response.ok) {
        toast.success("Message sent!")
        // Reload SMS logs
        loadSmsLogsFromSupabase(id)
      } else {
        toast.error("Failed to send message")
      }
    } catch (error) {
      console.error("Error sending SMS:", error)
      toast.error("Failed to send message")
    }
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">Job not found</p>
        <Link href="/jobs">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>
      </div>
    )
  }

  const assignedTechnicians = getTechniciansByIds(technicians, job.assigned_tech_ids)
  const primaryTechnician = assignedTechnicians[0] || null
  const jobPhotos = getPhotosByJobId(photos, job.id)
  const scheduledDate = new Date(job.scheduled_time)
  
  // State for managing technician assignment
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>(job.assigned_tech_ids || [])
  const [showTechDialog, setShowTechDialog] = useState(false)

  // Memoize handlers to prevent unnecessary re-renders
  const handleStatusChange = useCallback((newStatus: JobStatus) => {
    updateJobStatus(job.id, newStatus)
    toast.success(`Status updated to ${statusConfig[newStatus].label}`)
  }, [job.id, updateJobStatus])

  const handleAddTech = useCallback((techId: string) => {
    if (!selectedTechIds.includes(techId)) {
      const newTechIds = [...selectedTechIds, techId]
      setSelectedTechIds(newTechIds)
    }
  }, [selectedTechIds])

  const handleRemoveTech = useCallback((techId: string) => {
    const newTechIds = selectedTechIds.filter(id => id !== techId)
    setSelectedTechIds(newTechIds)
  }, [selectedTechIds])

  const handleSaveTechs = useCallback(() => {
    updateJob(job.id, { assigned_tech_ids: selectedTechIds.length > 0 ? selectedTechIds : null })
    setShowTechDialog(false)
    toast.success(`Technicians updated`)
  }, [job.id, selectedTechIds, updateJob])

  const handleSaveNotes = useCallback(() => {
    updateJob(job.id, { notes: notes || null })
    setEditingNotes(false)
    toast.success('Notes saved')
  }, [job.id, notes, updateJob])

  const handleDeleteJob = useCallback(async () => {
    setIsDeleting(true)
    try {
      await fetch(`/api/jobs/${job.id}`, {
        method: "DELETE",
      })
      deleteJob(job.id)
      toast.success('Job deleted')
      router.push("/jobs")
    } catch (error) {
      console.error("Error deleting job:", error)
      toast.error('Failed to delete job')
      setIsDeleting(false)
    }
  }, [job.id, deleteJob, router])

  const handleSendSMS = useCallback(async () => {
    const template = templates.find((t) => t.id === selectedTemplate)
    if (!template) return

    setSmsSending(true)
    const message = renderTemplate(template.template_body, job, primaryTechnician, settings)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    addSmsLog({
      job_id: job.id,
      recipient_phone: job.customer_phone,
      message_body: message,
      status: "sent",
    })

    setSmsSending(false)
    setSmsSent(true)
    toast.success('SMS sent successfully')
    setTimeout(() => setSmsSent(false), 3000)
  }, [job, primaryTechnician, settings, templates, selectedTemplate, addSmsLog])

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      addPhoto({
        job_id: job.id,
        photo_url: url,
        caption: null,
      })
    }
  }, [job.id, addPhoto])

  const handleDownloadPhoto = useCallback((photoUrl: string, photoId: string) => {
    const link = document.createElement("a")
    link.href = photoUrl
    link.download = `photo-${photoId}.jpg`
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-col gap-4">
        <Link
          href="/jobs"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {job.customer_name}
            </h1>
            <p className="text-muted-foreground">Job #{id}</p>
          </div>
          
          {/* Action Buttons - Mobile: wrap, Desktop: row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Dropdown - Merged with badge style */}
            <Select
              value={job.status}
              onValueChange={(v) => handleStatusChange(v as JobStatus)}
            >
              <SelectTrigger className={`w-[180px] border-0 font-medium ${statusConfig[job.status].className}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(statusConfig) as JobStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${statusConfig[s].className.split(' ')[0].replace('bg-', 'bg-').replace('text-', '')}`}></span>
                      {statusConfig[s].label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Manage Technicians */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowTechDialog(true)}
            >
              <User className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">
                {assignedTechnicians.length > 0 
                  ? `${assignedTechnicians.length} Techs` 
                  : 'Assign Techs'}
              </span>
              <span className="sm:hidden">Techs</span>
            </Button>

            {/* Edit Job */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit
            </Button>

            {/* Delete Job */}
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: '👤' },
            { id: 'activity', label: 'Activity', icon: '📋' },
            { id: 'messages', label: 'Messages', icon: '💬' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{job.customer_phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{job.customer_address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Job Type</p>
                <p className="font-medium">{job.job_type}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
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
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Assigned Technicians</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {assignedTechnicians.length > 0 ? (
                    assignedTechnicians.map(tech => (
                      <Badge key={tech.id} variant="secondary" className="text-xs">
                        {tech.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="font-medium text-muted-foreground">Unassigned</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Notes</CardTitle>
            {!editingNotes && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingNotes(true)}
              >
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editingNotes ? (
              <FieldGroup>
                <Field>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Add notes about this job..."
                  />
                </Field>
                <div className="flex gap-2">
                  <Button onClick={handleSaveNotes}>Save Notes</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNotes(job.notes || "")
                      setEditingNotes(false)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </FieldGroup>
            ) : (
              <p className="text-muted-foreground">
                {job.notes || "No notes added yet."}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Job Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {jobPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <Image
                    src={photo.photo_url}
                    alt={`Job photo ${photo.id}`}
                    width={150}
                    height={150}
                    className="rounded-lg object-cover w-[150px] h-[150px]"
                  />
                  <button
                    onClick={() => handleDownloadPhoto(photo.photo_url, photo.id)}
                    className="absolute top-2 left-2 p-1.5 bg-primary text-primary-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Download photo"
                    aria-label={`Download photo ${photo.id}`}
                  >
                    <Download className="h-3 w-3" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete photo"
                    aria-label={`Delete photo ${photo.id}`}
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </div>
              ))}
              <label 
                className="flex flex-col items-center justify-center w-[150px] h-[150px] border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                aria-label="Upload job photo"
              >
                <Camera className="h-8 w-8 text-muted-foreground mb-2" aria-hidden="true" />
                <span className="text-sm text-muted-foreground">Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  aria-label="Choose photo file"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* On Hold Reason Banner */}
        {job.status === 'on_hold' && job.on_hold_reason && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-amber-900">On Hold</p>
              <p className="text-sm text-amber-800">{job.on_hold_reason}</p>
            </div>
          </div>
        )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <JobTimeline jobId={id} />
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="max-w-2xl mx-auto">
            <SmsConversation
              jobId={id}
              customerName={job.customer_name}
              customerPhone={job.customer_phone}
              messages={smsLogs.filter((log) => log.job_id === id)}
              currentUserName={settings?.company_name || "Business"}
              currentUserType="admin"
              onSendMessage={handleSendMessage}
              templates={templates}
            />
          </div>
        )}

      </div>

      {/* Dialogs */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job for {job.customer_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteJob}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      {/* Technician Management Dialog */}
      <Dialog open={showTechDialog} onOpenChange={setShowTechDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Technicians</DialogTitle>
            <DialogDescription>
              Select technicians to assign to this job.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {technicians
              .filter((t) => t.is_active)
              .map((tech) => (
                <div key={tech.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`tech-${tech.id}`}
                    checked={selectedTechIds.includes(tech.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleAddTech(tech.id)
                      } else {
                        handleRemoveTech(tech.id)
                      }
                    }}
                  />
                  <label
                    htmlFor={`tech-${tech.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                  >
                    {tech.name}
                  </label>
                </div>
              ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveTechs} className="flex-1">
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedTechIds(job.assigned_tech_ids || [])
                setShowTechDialog(false)
              }}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Job Modal */}
      <EditJobModal
        job={job}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onJobUpdated={() => {
          // Job updated, refresh will happen automatically via store
        }}
      />
    </div>
  )
}
