"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field"
import { AddressAutocomplete } from "@/components/address-autocomplete"
import { useStore } from "@/lib/store"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Calendar, Clock, User, Phone, MapPin, Briefcase } from "lucide-react"
import Link from "next/link"
import { z } from "zod"

// Validation schema
const jobSchema = z.object({
  customerName: z.string().min(2, "Customer name must be at least 2 characters"),
  customerPhone: z.string().min(10, "Please enter a valid phone number"),
  customerEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  customerAddress: z.string().min(5, "Please enter a valid address"),
  jobType: z.string().min(1, "Please select a job type"),
  scheduledDate: z.string().min(1, "Please select a date"),
  scheduledTime: z.string().min(1, "Please select a time"),
  notes: z.string().optional(),
})

type JobFormData = z.infer<typeof jobSchema>

export default function NewJobPage() {
  const router = useRouter()
  const { createJob } = useStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof JobFormData, string>>>({})
  
  const [formData, setFormData] = useState<JobFormData>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
    jobType: "",
    scheduledDate: "",
    scheduledTime: "",
    notes: "",
  })

  const jobTypes = [
    "HVAC Repair",
    "HVAC Installation",
    "HVAC Maintenance",
    "Plumbing Repair",
    "Plumbing Installation",
    "Electrical Repair",
    "Electrical Installation",
    "General Maintenance",
    "Emergency Service",
    "Inspection",
    "Other",
  ]

  const validateForm = (): boolean => {
    try {
      jobSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof JobFormData, string>> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof JobFormData] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    setIsSubmitting(true)

    try {
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)
      
      await createJob({
        customer_name: formData.customerName,
        customer_phone: formData.customerPhone,
        customer_email: formData.customerEmail || null,
        customer_address: formData.customerAddress,
        job_type: formData.jobType,
        scheduled_time: scheduledDateTime.toISOString(),
        notes: formData.notes || null,
        status: "scheduled",
      })

      toast.success("Job created successfully!")
      router.push("/jobs")
    } catch (error) {
      console.error("[NewJobPage] Error creating job:", error)
      toast.error("Failed to create job. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddressSelect = (address: string) => {
    setFormData((prev) => ({ ...prev, customerAddress: address }))
    if (errors.customerAddress) {
      setErrors((prev) => ({ ...prev, customerAddress: undefined }))
    }
  }

  const updateField = (field: keyof JobFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/jobs">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Job</CardTitle>
          <CardDescription>Enter the job details below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup className="space-y-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel>
                      Customer Name <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      placeholder="John Smith"
                      value={formData.customerName}
                      onChange={(e) => updateField("customerName", e.target.value)}
                    />
                    {errors.customerName && <FieldError>{errors.customerName}</FieldError>}
                  </Field>

                  <Field>
                    <FieldLabel>
                      Phone Number <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.customerPhone}
                      onChange={(e) => updateField("customerPhone", e.target.value)}
                    />
                    {errors.customerPhone && <FieldError>{errors.customerPhone}</FieldError>}
                  </Field>
                </div>

                <Field>
                  <FieldLabel>Email Address</FieldLabel>
                  <Input
                    type="email"
                    placeholder="customer@example.com"
                    value={formData.customerEmail}
                    onChange={(e) => updateField("customerEmail", e.target.value)}
                  />
                  {errors.customerEmail && <FieldError>{errors.customerEmail}</FieldError>}
                </Field>

                <Field>
                  <FieldLabel>
                    Service Address <span className="text-destructive">*</span>
                  </FieldLabel>
                  <AddressAutocomplete
                    value={formData.customerAddress}
                    onChange={(value) => updateField("customerAddress", value)}
                    onSelect={handleAddressSelect}
                    placeholder="Enter service address"
                  />
                  {errors.customerAddress && <FieldError>{errors.customerAddress}</FieldError>}
                </Field>
              </div>

              {/* Job Details */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Job Details
                </h3>

                <Field>
                  <FieldLabel>
                    Job Type <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Select value={formData.jobType} onValueChange={(v) => updateField("jobType", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.jobType && <FieldError>{errors.jobType}</FieldError>}
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel>
                      Scheduled Date <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => updateField("scheduledDate", e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                    {errors.scheduledDate && <FieldError>{errors.scheduledDate}</FieldError>}
                  </Field>

                  <Field>
                    <FieldLabel>
                      Scheduled Time <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => updateField("scheduledTime", e.target.value)}
                    />
                    {errors.scheduledTime && <FieldError>{errors.scheduledTime}</FieldError>}
                  </Field>
                </div>

                <Field>
                  <FieldLabel>Notes</FieldLabel>
                  <Textarea
                    placeholder="Additional details about the job..."
                    value={formData.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    rows={4}
                  />
                </Field>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Link href="/jobs" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Job"
                  )}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
