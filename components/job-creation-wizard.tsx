"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  ChevronRight,
  ChevronLeft,
  User,
  MapPin,
  Wrench,
  Calendar,
  Users,
  CheckCircle,
  Loader2,
  Phone,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Technician } from "@/lib/types"
import { useStore } from "@/lib/store"

interface JobCreationWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

type Step = {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

const steps: Step[] = [
  {
    id: "customer",
    title: "Customer",
    description: "Who is this job for?",
    icon: <User className="h-5 w-5" />,
  },
  {
    id: "details",
    title: "Details",
    description: "What needs to be done?",
    icon: <Wrench className="h-5 w-5" />,
  },
  {
    id: "schedule",
    title: "Schedule",
    description: "When and who?",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    id: "review",
    title: "Review",
    description: "Ready to dispatch?",
    icon: <CheckCircle className="h-5 w-5" />,
  },
]

export function JobCreationWizard({
  open,
  onOpenChange,
  onSuccess,
}: JobCreationWizardProps) {
  const { technicians: storeTechnicians, addJob, settings } = useStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Form data
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    job_type: "",
    notes: "",
    scheduled_date: "",
    scheduled_time: "",
    assigned_tech_ids: [] as string[],
    send_notification: true,
  })

  // Get available job types
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

  // Reset form when opened
  useEffect(() => {
    if (open) {
      setCurrentStep(0)
      setFormData({
        customer_name: "",
        customer_phone: "",
        customer_address: "",
        job_type: "",
        notes: "",
        scheduled_date: "",
        scheduled_time: "",
        assigned_tech_ids: [],
        send_notification: true,
      })
      setErrors({})
    }
  }, [open])

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 0) {
      if (!formData.customer_name.trim()) {
        newErrors.customer_name = "Customer name is required"
      }
      if (!formData.customer_phone.trim()) {
        newErrors.customer_phone = "Phone number is required"
      }
      if (!formData.customer_address.trim()) {
        newErrors.customer_address = "Address is required"
      }
    }

    if (step === 1) {
      if (!formData.job_type) {
        newErrors.job_type = "Job type is required"
      }
    }

    if (step === 2) {
      if (!formData.scheduled_date) {
        newErrors.scheduled_date = "Date is required"
      }
      if (!formData.scheduled_time) {
        newErrors.scheduled_time = "Time is required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsLoading(true)
    try {
      const scheduledDateTime = new Date(
        `${formData.scheduled_date}T${formData.scheduled_time}`
      ).toISOString()

      await addJob({
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_address: formData.customer_address,
        job_type: formData.job_type,
        notes: formData.notes || null,
        scheduled_time: scheduledDateTime,
        status: "scheduled",
        assigned_tech_ids:
          formData.assigned_tech_ids.length > 0
            ? formData.assigned_tech_ids
            : null,
      })

      toast.success("Job created successfully!")
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast.error("Failed to create job")
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
              index === currentStep
                ? "bg-primary text-primary-foreground"
                : index < currentStep
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {index < currentStep ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              step.icon
            )}
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "w-12 h-1 mx-1 transition-colors",
                index < currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  )

  const StepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">
                Customer Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="customer_name"
                placeholder="John Smith"
                value={formData.customer_name}
                onChange={(e) => updateField("customer_name", e.target.value)}
                className={cn(errors.customer_name && "border-destructive")}
              />
              {errors.customer_name && (
                <p className="text-sm text-destructive">{errors.customer_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Select
                  value="+1"
                  onValueChange={() => {}}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue>🇺🇸 +1</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+1">🇺🇸 +1</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="customer_phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.customer_phone}
                  onChange={(e) => updateField("customer_phone", e.target.value)}
                  className={cn("flex-1", errors.customer_phone && "border-destructive")}
                />
              </div>
              {errors.customer_phone && (
                <p className="text-sm text-destructive">{errors.customer_phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_address">
                Address <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="customer_address"
                placeholder="123 Main St, City, State 12345"
                value={formData.customer_address}
                onChange={(e) => updateField("customer_address", e.target.value)}
                className={cn(errors.customer_address && "border-destructive")}
                rows={3}
              />
              {errors.customer_address && (
                <p className="text-sm text-destructive">{errors.customer_address}</p>
              )}
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Job Type <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {allJobTypes.slice(0, 6).map((type) => (
                  <button
                    key={type}
                    onClick={() => updateField("job_type", type)}
                    className={cn(
                      "p-4 rounded-lg border text-left transition-all hover:border-primary",
                      formData.job_type === type
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                  >
                    <Wrench
                      className={cn(
                        "h-5 w-5 mb-2",
                        formData.job_type === type
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    />
                    <span className="text-sm font-medium">{type}</span>
                  </button>
                ))}
              </div>
              {errors.job_type && (
                <p className="text-sm text-destructive">{errors.job_type}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special instructions or details..."
                value={formData.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => updateField("scheduled_date", e.target.value)}
                  className={cn(errors.scheduled_date && "border-destructive")}
                />
                {errors.scheduled_date && (
                  <p className="text-sm text-destructive">{errors.scheduled_date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => updateField("scheduled_time", e.target.value)}
                  className={cn(errors.scheduled_time && "border-destructive")}
                />
                {errors.scheduled_time && (
                  <p className="text-sm text-destructive">{errors.scheduled_time}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assign Technicians</Label>
              <div className="space-y-2">
                {storeTechnicians.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No technicians available. Add technicians in settings.
                  </p>
                ) : (
                  storeTechnicians
                    .filter((t) => t.is_active)
                    .map((tech) => (
                      <div key={tech.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tech-${tech.id}`}
                          checked={formData.assigned_tech_ids.includes(tech.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateField("assigned_tech_ids", [
                                ...formData.assigned_tech_ids,
                                tech.id,
                              ])
                            } else {
                              updateField(
                                "assigned_tech_ids",
                                formData.assigned_tech_ids.filter(
                                  (id) => id !== tech.id
                                )
                              )
                            }
                          }}
                        />
                        <Label htmlFor={`tech-${tech.id}`} className="font-normal">
                          {tech.name}
                        </Label>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <Checkbox
                id="send_notification"
                checked={formData.send_notification}
                onCheckedChange={(checked) =>
                  updateField("send_notification", checked)
                }
              />
              <Label htmlFor="send_notification" className="font-normal">
                Send SMS notification to customer
              </Label>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{formData.customer_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formData.customer_phone}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <p className="text-sm">{formData.customer_address}</p>
              </div>

              <div className="flex items-start gap-3">
                <Wrench className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{formData.job_type}</p>
                  {formData.notes && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <p className="text-sm">
                  {formData.scheduled_date} at {formData.scheduled_time}
                </p>
              </div>

              {formData.assigned_tech_ids.length > 0 && (
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <p className="text-sm">
                    {formData.assigned_tech_ids.length} technician
                    {formData.assigned_tech_ids.length > 1 ? "s" : ""} assigned
                  </p>
                </div>
              )}
            </div>

            {formData.send_notification && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Customer will receive an SMS notification
              </p>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
        </DialogHeader>

        <StepIndicator />

        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold">{steps[currentStep].title}</h3>
                <p className="text-sm text-muted-foreground">
                  {steps[currentStep].description}
                </p>
              </div>

              <StepContent />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Job
                  <CheckCircle className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
