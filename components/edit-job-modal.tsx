"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button, BrandButton } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { useStore } from "@/lib/store"
import type { Job, Technician, JobStatus } from "@/lib/types"

interface EditJobModalProps {
  job: Job | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onJobUpdated?: () => void
}

const statusOptions: { value: JobStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "scheduled", label: "Scheduled" },
  { value: "en_route", label: "En Route" },
  { value: "working", label: "Working" },
  { value: "on_hold", label: "On Hold" },
  { value: "complete", label: "Complete" },
]

export function EditJobModal({ job, open, onOpenChange, onJobUpdated }: EditJobModalProps) {
  const { technicians, settings, loadJobsFromSupabase } = useStore()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Combine default and custom job types
  const defaultJobTypes = [
    "Service Call",
    "Installation",
    "Repair",
    "Maintenance",
    "Inspection",
    "Emergency",
    "Consultation",
  ]
  const customJobTypes = settings?.custom_job_types || []
  const allJobTypes = [...new Set([...defaultJobTypes, ...customJobTypes])]

  // Form state
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    job_type: "",
    status: "scheduled" as JobStatus,
    scheduled_date: "",
    scheduled_time: "",
    notes: "",
    on_hold_reason: "",
    assigned_tech_ids: [] as string[],
  })

  // Populate form when job changes
  useEffect(() => {
    if (job) {
      const scheduledDate = new Date(job.scheduled_time)
      setFormData({
        customer_name: job.customer_name,
        customer_phone: job.customer_phone,
        customer_address: job.customer_address,
        job_type: job.job_type,
        status: job.status,
        scheduled_date: scheduledDate.toISOString().split("T")[0],
        scheduled_time: scheduledDate.toTimeString().slice(0, 5),
        notes: job.notes || "",
        on_hold_reason: job.on_hold_reason || "",
        assigned_tech_ids: job.assigned_tech_ids || [],
      })
      setErrors({})
    }
  }, [job])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = "Customer name is required"
    }
    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = "Phone number is required"
    }
    if (!formData.customer_address.trim()) {
      newErrors.customer_address = "Address is required"
    }
    if (!formData.scheduled_date || !formData.scheduled_time) {
      newErrors.scheduled_time = "Date and time are required"
    }
    if (formData.status === "on_hold" && !formData.on_hold_reason.trim()) {
      newErrors.on_hold_reason = "On-hold reason is required when status is On Hold"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!job) return
    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Combine date and time
      const scheduledDateTime = new Date(
        `${formData.scheduled_date}T${formData.scheduled_time}`
      ).toISOString()

      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          customer_address: formData.customer_address,
          job_type: formData.job_type,
          status: formData.status,
          scheduled_time: scheduledDateTime,
          notes: formData.notes || null,
          on_hold_reason: formData.status === "on_hold" ? formData.on_hold_reason : null,
          assigned_tech_ids: formData.assigned_tech_ids.length > 0 ? formData.assigned_tech_ids : null,
        }),
      })

      if (response.ok) {
        toast.success("Job updated successfully")
        await loadJobsFromSupabase()
        onJobUpdated?.()
        onOpenChange(false)
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to update job")
      }
    } catch (error) {
      console.error("Error updating job:", error)
      toast.error("Failed to update job")
    } finally {
      setIsLoading(false)
    }
  }

  const isValid =
    formData.customer_name &&
    formData.customer_phone &&
    formData.customer_address &&
    formData.scheduled_date &&
    formData.scheduled_time &&
    (formData.status !== "on_hold" || formData.on_hold_reason)

  if (!job) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job</DialogTitle>
          <DialogDescription>Update job details for {job.customer_name}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <FieldGroup className="gap-4">
              {/* Customer Info */}
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Customer Information
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="edit_customer_name">
                    Name <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    id="edit_customer_name"
                    value={formData.customer_name}
                    onChange={(e) => {
                      setFormData({ ...formData, customer_name: e.target.value })
                      if (errors.customer_name) {
                        setErrors({ ...errors, customer_name: "" })
                      }
                    }}
                    className={errors.customer_name ? "border-red-500" : ""}
                  />
                  {errors.customer_name && (
                    <p className="text-sm text-red-500 mt-1">{errors.customer_name}</p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit_customer_phone">
                    Phone <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    id="edit_customer_phone"
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) => {
                      setFormData({ ...formData, customer_phone: e.target.value })
                      if (errors.customer_phone) {
                        setErrors({ ...errors, customer_phone: "" })
                      }
                    }}
                    className={errors.customer_phone ? "border-red-500" : ""}
                  />
                  {errors.customer_phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.customer_phone}</p>
                  )}
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="edit_customer_address">
                  Address <span className="text-red-500">*</span>
                </FieldLabel>
                <Textarea
                  id="edit_customer_address"
                  value={formData.customer_address}
                  onChange={(e) => {
                    setFormData({ ...formData, customer_address: e.target.value })
                    if (errors.customer_address) {
                      setErrors({ ...errors, customer_address: "" })
                    }
                  }}
                  rows={2}
                  className={errors.customer_address ? "border-red-500" : ""}
                />
                {errors.customer_address && (
                  <p className="text-sm text-red-500 mt-1">{errors.customer_address}</p>
                )}
              </Field>

              {/* Job Details */}
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-2">
                Job Details
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="edit_job_type">Job Type</FieldLabel>
                  <Select
                    value={formData.job_type}
                    onValueChange={(value) => setFormData({ ...formData, job_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      {allJobTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit_status">Status</FieldLabel>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value as JobStatus })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              {/* On-hold reason */}
              {formData.status === "on_hold" && (
                <Field>
                  <FieldLabel htmlFor="edit_on_hold_reason">
                    On-Hold Reason <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Textarea
                    id="edit_on_hold_reason"
                    value={formData.on_hold_reason}
                    onChange={(e) => {
                      setFormData({ ...formData, on_hold_reason: e.target.value })
                      if (errors.on_hold_reason) {
                        setErrors({ ...errors, on_hold_reason: "" })
                      }
                    }}
                    rows={2}
                    className={errors.on_hold_reason ? "border-red-500" : ""}
                    placeholder="Why is this job on hold?"
                  />
                  {errors.on_hold_reason && (
                    <p className="text-sm text-red-500 mt-1">{errors.on_hold_reason}</p>
                  )}
                </Field>
              )}

              {/* Technicians */}
              <Field>
                <FieldLabel>Assign Technicians</FieldLabel>
                <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                  {technicians.length > 0 ? (
                    technicians
                      .filter((t) => t.is_active)
                      .map((tech) => (
                        <label
                          key={tech.id}
                          className="flex items-center gap-2 py-2 hover:bg-muted/50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.assigned_tech_ids.includes(tech.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  assigned_tech_ids: [...formData.assigned_tech_ids, tech.id],
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  assigned_tech_ids: formData.assigned_tech_ids.filter(
                                    (id) => id !== tech.id
                                  ),
                                })
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <span className="text-sm">{tech.name}</span>
                        </label>
                      ))
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">No technicians available</p>
                  )}
                </div>
                {formData.assigned_tech_ids.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.assigned_tech_ids.length} technician
                    {formData.assigned_tech_ids.length > 1 ? "s" : ""} selected
                  </p>
                )}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="edit_scheduled_date">Date</FieldLabel>
                  <Input
                    id="edit_scheduled_date"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit_scheduled_time">Time</FieldLabel>
                  <Input
                    id="edit_scheduled_time"
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                  />
                </Field>
              </div>

              {/* Notes */}
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-2">
                Additional Info
              </p>
              <Field>
                <FieldLabel htmlFor="edit_notes">Notes</FieldLabel>
                <Textarea
                  id="edit_notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </Field>
            </FieldGroup>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <BrandButton type="submit" disabled={!isValid || isLoading}>
              {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Save Changes
            </BrandButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
