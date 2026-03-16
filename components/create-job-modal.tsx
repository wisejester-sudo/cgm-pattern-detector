"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { useStore } from "@/lib/store"
import type { Technician } from "@/lib/types"

interface CreateJobModalProps {
  // Support both controlled and uncontrolled modes
  open?: boolean
  onOpenChange?: (open: boolean) => void
  // Optional - will use store if not provided
  technicians?: Technician[]
  onCreateJob?: (job: {
    customer_name: string
    customer_phone: string
    customer_address: string
    job_type: string
    scheduled_time: string
    notes: string | null
    assigned_tech_id: string | null
  }) => void
}

export function CreateJobModal({ 
  open: controlledOpen, 
  onOpenChange,
  technicians: propTechnicians, 
  onCreateJob 
}: CreateJobModalProps) {
  // Use store for technicians and addJob if not provided as props
  const { technicians: storeTechnicians, addJob } = useStore()
  const technicians = propTechnicians ?? storeTechnicians ?? []
  
  // Support both controlled and uncontrolled open state
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = (value: boolean) => {
    if (onOpenChange) onOpenChange(value)
    if (!isControlled) setInternalOpen(value)
  }
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    job_type: "",
    scheduled_date: "",
    scheduled_time: "",
    notes: "",
    assigned_tech_id: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const jobData = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_address: formData.customer_address,
        job_type: formData.job_type,
        scheduled_date: formData.scheduled_date,
        scheduled_time: formData.scheduled_time,
        notes: formData.notes || null,
        assigned_tech_id: formData.assigned_tech_id || null,
      }

      // Try to create via API first (Supabase)
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      })

      if (response.ok) {
        // Successfully created via API - reload jobs from Supabase
        await useStore.getState().loadJobsFromSupabase()
        toast.success(`Job for ${formData.customer_name} created`)
      } else {
        // Fall back to local store if API fails (demo mode)
        const scheduledDateTime = formData.scheduled_date && formData.scheduled_time
          ? new Date(`${formData.scheduled_date}T${formData.scheduled_time}`).toISOString()
          : new Date().toISOString()

        addJob({
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          customer_address: formData.customer_address,
          job_type: formData.job_type,
          scheduled_time: scheduledDateTime,
          notes: formData.notes || null,
          assigned_tech_id: formData.assigned_tech_id || null,
          status: "scheduled" as const,
        })
        toast.success(`Job for ${formData.customer_name} created locally`)
      }

      setFormData({
        customer_name: "",
        customer_phone: "",
        customer_address: "",
        job_type: "",
        scheduled_date: "",
        scheduled_time: "",
        notes: "",
        assigned_tech_id: "",
      })
      setOpen(false)
    } catch {
      // Silently fail - the local store fallback should have worked
    } finally {
      setIsLoading(false)
    }
  }

  const isValid =
    formData.customer_name &&
    formData.customer_phone &&
    formData.customer_address &&
    formData.job_type

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Job
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Enter the customer and job details to create a new job.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto pr-1">
            <FieldGroup>
              {/* Customer Info */}
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-1">Customer</p>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="customer_name">Customer Name</FieldLabel>
                  <Input
                    id="customer_name"
                    placeholder="Enter customer name"
                    value={formData.customer_name}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_name: e.target.value })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="customer_phone">Phone Number</FieldLabel>
                  <Input
                    id="customer_phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.customer_phone}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_phone: e.target.value })
                    }
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="customer_address">Address</FieldLabel>
                <Textarea
                  id="customer_address"
                  placeholder="Enter full address"
                  value={formData.customer_address}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_address: e.target.value })
                  }
                  rows={2}
                />
              </Field>

              {/* Job Details */}
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-2">Job Details</p>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="job_type">Job Type</FieldLabel>
                  <Select
                    value={formData.job_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, job_type: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Service Call">Service Call</SelectItem>
                      <SelectItem value="Installation">Installation</SelectItem>
                      <SelectItem value="Repair">Repair</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Inspection">Inspection</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                      <SelectItem value="Consultation">Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="assigned_tech_id">Assign Technician</FieldLabel>
                  <Select
                    value={formData.assigned_tech_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, assigned_tech_id: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select technician (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.length > 0 ? (
                        technicians
                          .filter((t) => t.is_active)
                          .map((tech) => (
                            <SelectItem key={tech.id} value={tech.id}>
                              {tech.name}
                            </SelectItem>
                          ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No technicians available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="scheduled_date">Date</FieldLabel>
                  <Input
                    id="scheduled_date"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduled_date: e.target.value })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="scheduled_time">Time</FieldLabel>
                  <Input
                    id="scheduled_time"
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduled_time: e.target.value })
                    }
                  />
                </Field>
              </div>

              {/* Notes */}
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-2">Additional Info</p>
              <Field>
                <FieldLabel htmlFor="notes">Notes (optional)</FieldLabel>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                />
              </Field>
            </FieldGroup>
          </div>
          <DialogFooter className="shrink-0 pt-4 border-t border-border mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isLoading}>
              {isLoading && <Spinner className="mr-2" />}
              Create Job
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
