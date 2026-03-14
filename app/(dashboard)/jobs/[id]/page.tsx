"use client"

import { use, useState } from "react"
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
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useStore, getTechnicianById, getPhotosByJobId, renderTemplate } from "@/lib/store"
import type { JobStatus } from "@/lib/types"
import { statusConfig } from "@/components/job-card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"

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
    settings,
    updateJob,
    updateJobStatus,
    addPhoto,
    deletePhoto,
    deleteJob,
    addSmsLog,
  } = useStore()

  const job = jobs.find((j) => j.id === id)
  const [smsSending, setSmsSending] = useState(false)
  const [smsSent, setSmsSent] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]?.id || "")
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState(job?.notes || "")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const technician = getTechnicianById(technicians, job.assigned_tech_id)
  const jobPhotos = getPhotosByJobId(photos, job.id)
  const scheduledDate = new Date(job.scheduled_time)

  const handleStatusChange = (newStatus: JobStatus) => {
    updateJobStatus(job.id, newStatus)
    toast.success(`Status updated to ${statusConfig[newStatus].label}`)
  }

  const handleTechChange = (techId: string) => {
    updateJob(job.id, { assigned_tech_id: techId || null })
    const tech = technicians.find(t => t.id === techId)
    toast.success(tech ? `Assigned to ${tech.name}` : 'Technician unassigned')
  }

  const handleSaveNotes = () => {
    updateJob(job.id, { notes: notes || null })
    setEditingNotes(false)
    toast.success('Notes saved')
  }

  const handleDeleteJob = async () => {
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
  }

  const handleSendSMS = async () => {
    const template = templates.find((t) => t.id === selectedTemplate)
    if (!template) return

    setSmsSending(true)
    const message = renderTemplate(template.template_body, job, technician, settings)

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
          <Badge
            className={`${statusConfig[job.status].className} text-sm px-3 py-1`}
          >
            {statusConfig[job.status].label}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{job.customer_phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <MapPin className="h-4 w-4 text-muted-foreground" />
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
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assigned Technician</p>
                <p className="font-medium">
                  {technician?.name || "Unassigned"}
                </p>
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
                    alt="Job photo"
                    width={150}
                    height={150}
                    className="rounded-lg object-cover w-[150px] h-[150px]"
                  />
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center w-[150px] h-[150px] border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field>
                <FieldLabel>Update Status</FieldLabel>
                <Select
                  value={job.status}
                  onValueChange={(v) => handleStatusChange(v as JobStatus)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(statusConfig) as JobStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {statusConfig[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Assign Technician</FieldLabel>
                <Select
                  value={job.assigned_tech_id || ""}
                  onValueChange={handleTechChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians
                      .filter((t) => t.is_active)
                      .map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>SMS Template</FieldLabel>
                <Select
                  value={selectedTemplate}
                  onValueChange={setSelectedTemplate}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                onClick={handleSendSMS}
                disabled={smsSending || !selectedTemplate}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                {smsSending ? "Sending..." : smsSent ? "SMS Sent!" : "Send Status SMS"}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Job
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

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
    </div>
  )
}
