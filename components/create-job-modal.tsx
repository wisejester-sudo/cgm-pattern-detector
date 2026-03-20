"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button, BrandButton } from "@/components/ui/button"
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
    assigned_tech_ids: string[] | null
  }) => void
}

export function CreateJobModal({ 
  open: controlledOpen, 
  onOpenChange,
  technicians: propTechnicians, 
  onCreateJob 
}: CreateJobModalProps) {
  // Use store for technicians, settings, and addJob if not provided as props
  const { technicians: storeTechnicians, addJob, settings } = useStore()
  const technicians = propTechnicians ?? storeTechnicians ?? []
  
  // Combine default and custom job types
  const defaultJobTypes = [
    "Service Call",
    "Installation", 
    "Repair",
    "Maintenance",
    "Inspection",
    "Emergency",
    "Consultation"
  ]
  const customJobTypes = settings?.custom_job_types || []
  const allJobTypes = [...new Set([...defaultJobTypes, ...customJobTypes])]
  
  // Support both controlled and uncontrolled open state
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = (value: boolean) => {
    if (onOpenChange) onOpenChange(value)
    if (!isControlled) setInternalOpen(value)
  }
  const [isLoading, setIsLoading] = useState(false)
  const [countryCode, setCountryCode] = useState("+1")
  const [phoneInput, setPhoneInput] = useState("")
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    job_type: "",
    scheduled_date: "",
    scheduled_time: "",
    notes: "",
    assigned_tech_ids: [] as string[],
  })
  
  // Validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Normalize phone number to E.164 format
  const normalizePhone = (countryCode: string, phone: string): string => {
    const digitsOnly = phone.replace(/\D/g, '')
    if (digitsOnly.startsWith(countryCode.replace('+', ''))) {
      return `+${digitsOnly}`
    }
    return `${countryCode}${digitsOnly}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({}) // Clear previous errors

    try {
      const scheduledDateTime = formData.scheduled_date && formData.scheduled_time
        ? new Date(`${formData.scheduled_date}T${formData.scheduled_time}`).toISOString()
        : new Date().toISOString()

      const jobData = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_address: formData.customer_address,
        job_type: formData.job_type,
        scheduled_time: scheduledDateTime,
        notes: formData.notes || null,
        assigned_tech_ids: formData.assigned_tech_ids.length > 0 ? formData.assigned_tech_ids : null,
        on_hold_reason: null,
        status: "scheduled" as const,
      }

      // Create job via store (which calls API)
      await addJob(jobData)
      
      toast.success(`Job for ${formData.customer_name} created`)

      setFormData({
        customer_name: "",
        customer_phone: "",
        customer_address: "",
        job_type: "",
        scheduled_date: "",
        scheduled_time: "",
        notes: "",
        assigned_tech_ids: [] as string[],
      })
      setErrors({})
      setOpen(false)
    } catch (error: any) {
      console.error('Failed to create job:', error)
      
      // Check if error has validation details
      if (error.details && typeof error.details === 'object') {
        setErrors(error.details)
        toast.error('Please fix the validation errors below', { duration: 5000 })
      } else {
        toast.error(error.message || 'Failed to create job. Please try again.')
      }
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
        <BrandButton>
          <Plus className="mr-2 h-4 w-4" />
          Create Job
        </BrandButton>
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
                    onChange={(e) => {
                      setFormData({ ...formData, customer_name: e.target.value })
                      if (errors.customer_name) {
                        setErrors({ ...errors, customer_name: '' })
                      }
                    }}
                    className={errors.customer_name ? "border-red-500" : ""}
                  />
                  {errors.customer_name && (
                    <p className="text-sm text-red-500 mt-1">{errors.customer_name}</p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="customer_phone">Phone Number</FieldLabel>
                  <div className="flex gap-2">
                    <select
                      className="w-24 px-2 py-2 border rounded-md text-sm bg-background"
                      value={countryCode}
                      onChange={(e) => {
                        setCountryCode(e.target.value)
                        setFormData({ ...formData, customer_phone: normalizePhone(e.target.value, phoneInput) })
                      }}
                    >
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+34">🇪🇸 +34</option>
                      <option value="+39">🇮🇹 +39</option>
                      <option value="+81">🇯🇵 +81</option>
                      <option value="+86">🇨🇳 +86</option>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+52">🇲🇽 +52</option>
                      <option value="+55">🇧🇷 +55</option>
                    </select>
                    <Input
                      id="customer_phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={phoneInput}
                      onChange={(e) => {
                        setPhoneInput(e.target.value)
                        setFormData({ ...formData, customer_phone: normalizePhone(countryCode, e.target.value) })
                        if (errors.customer_phone) {
                          setErrors({ ...errors, customer_phone: '' })
                        }
                      }}
                      className={`flex-1 ${errors.customer_phone ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.customer_phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.customer_phone}</p>
                  )}
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="customer_address">Address</FieldLabel>
                <Textarea
                  id="customer_address"
                  placeholder="Enter full address"
                  value={formData.customer_address}
                  onChange={(e) => {
                    setFormData({ ...formData, customer_address: e.target.value })
                    if (errors.customer_address) {
                      setErrors({ ...errors, customer_address: '' })
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
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-2">Job Details</p>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="job_type">Job Type</FieldLabel>
                  <Select
                    value={formData.job_type}
                    onValueChange={(value) => {
                      setFormData({ ...formData, job_type: value })
                      if (errors.job_type) {
                        setErrors({ ...errors, job_type: '' })
                      }
                    }}
                  >
                    <SelectTrigger className={`w-full ${errors.job_type ? "border-red-500" : ""}`}>
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
                  {errors.job_type && (
                    <p className="text-sm text-red-500 mt-1">{errors.job_type}</p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="assigned_tech_ids">Assign Technician</FieldLabel>
                  <Select
                    value={formData.assigned_tech_ids[0] || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, assigned_tech_ids: value ? [value] : [] })
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
            <BrandButton type="submit" disabled={!isValid || isLoading}>
              {isLoading && <Spinner className="mr-2" />}
              Create Job
            </BrandButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
