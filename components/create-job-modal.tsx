"use client"

import { useState } from "react"
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
import type { Technician } from "@/lib/types"

interface CreateJobModalProps {
  technicians: Technician[]
  onCreateJob: (job: {
    customer_name: string
    customer_phone: string
    customer_address: string
    job_type: string
    scheduled_time: string
    notes: string | null
    assigned_tech_id: string | null
  }) => void
}

export function CreateJobModal({ technicians, onCreateJob }: CreateJobModalProps) {
  const [open, setOpen] = useState(false)
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

    // Combine date and time
    const scheduledDateTime = formData.scheduled_date && formData.scheduled_time
      ? new Date(`${formData.scheduled_date}T${formData.scheduled_time}`).toISOString()
      : new Date().toISOString()

    onCreateJob({
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      customer_address: formData.customer_address,
      job_type: formData.job_type,
      scheduled_time: scheduledDateTime,
      notes: formData.notes || null,
      assigned_tech_id: formData.assigned_tech_id || null,
    })

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
    setIsLoading(false)
    setOpen(false)
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Enter the customer and job details to create a new job.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
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
                  <SelectItem value="AC Repair">AC Repair</SelectItem>
                  <SelectItem value="AC Installation">AC Installation</SelectItem>
                  <SelectItem value="Furnace Repair">Furnace Repair</SelectItem>
                  <SelectItem value="Furnace Maintenance">Furnace Maintenance</SelectItem>
                  <SelectItem value="Duct Cleaning">Duct Cleaning</SelectItem>
                  <SelectItem value="System Inspection">System Inspection</SelectItem>
                </SelectContent>
              </Select>
            </Field>
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
              <FieldLabel htmlFor="notes">Notes (optional)</FieldLabel>
              <Textarea
                id="notes"
                placeholder="Any additional notes..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={2}
              />
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-6">
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
