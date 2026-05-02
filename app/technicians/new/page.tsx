"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field"
import { useStore } from "@/lib/store"
import { toast } from "sonner"
import { ArrowLeft, Loader2, User, Mail, Phone, Lock, Send, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { z } from "zod"

// Validation schema
const technicianSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  phone: z.string().min(10, "Please enter a valid phone number").optional().or(z.literal("")),
  pin: z.string().length(4, "PIN must be exactly 4 digits"),
  pinConfirm: z.string(),
  sendInvite: z.boolean().default(true),
}).refine((data) => data.pin === data.pinConfirm, {
  message: "PINs do not match",
  path: ["pinConfirm"],
})

type TechnicianFormData = z.infer<typeof technicianSchema>

export default function NewTechnicianPage() {
  const router = useRouter()
  const { createTechnician } = useStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [magicLink, setMagicLink] = useState<string | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof TechnicianFormData, string>>>({})
  
  const [formData, setFormData] = useState<TechnicianFormData>({
    name: "",
    email: "",
    phone: "",
    pin: "",
    pinConfirm: "",
    sendInvite: true,
  })

  const validateForm = (): boolean => {
    try {
      technicianSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof TechnicianFormData, string>> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof TechnicianFormData] = err.message
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
      const tech = await createTechnician({
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        pin: formData.pin,
        is_active: true,
      })

      // Generate magic link URL
      if (tech?.magic_link_token) {
        setMagicLink(`${window.location.origin}/t/${tech.magic_link_token}`)
      }

      setIsSuccess(true)
      toast.success("Technician added successfully!")
    } catch (error) {
      console.error("[NewTechnicianPage] Error creating technician:", error)
      toast.error("Failed to add technician. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (field: keyof TechnicianFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const copyMagicLink = async () => {
    if (!magicLink) return
    await navigator.clipboard.writeText(magicLink)
    toast.success("Magic link copied to clipboard")
  }

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Technician Added!</h2>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              {formData.name} has been added to your team. {formData.sendInvite && formData.email 
                ? "An invitation email has been sent." 
                : "Share the magic link below to give them access."}
            </p>
            
            {magicLink && (
              <div className="w-full max-w-md space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Magic Link</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm bg-background px-3 py-2 rounded border truncate">
                      {magicLink}
                    </code>
                    <Button size="sm" onClick={copyMagicLink}>
                      Copy
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  This link allows {formData.name} to access their jobs without a password.
                </p>
              </div>
            )}
            
            <div className="flex gap-4 mt-8">
              <Link href="/technicians">
                <Button variant="outline">Back to Technicians</Button>
              </Link>
              <Button onClick={() => {
                setIsSuccess(false)
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  pin: "",
                  pinConfirm: "",
                  sendInvite: true,
                })
                setMagicLink(null)
              }}>
                Add Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/technicians">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Technicians
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6" />
            Add New Technician
          </CardTitle>
          <CardDescription>
            Add a technician to your team. They&apos;ll receive a magic link to access their jobs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <Field>
                  <FieldLabel>
                    Full Name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    placeholder="John Smith"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                  />
                  {errors.name && <FieldError>{errors.name}</FieldError>}
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </FieldLabel>
                    <Input
                      type="email"
                      placeholder="tech@example.com"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                    />
                    {errors.email && <FieldError>{errors.email}</FieldError>}
                  </Field>

                  <Field>
                    <FieldLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </FieldLabel>
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                    />
                    {errors.phone && <FieldError>{errors.phone}</FieldError>}
                  </Field>
                </div>
              </div>

              {/* PIN Setup */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Mobile PIN Setup
                </h3>
                <p className="text-sm text-muted-foreground">
                  Technicians use this 4-digit PIN to log in on their mobile devices.
                </p>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel>
                      PIN <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="4 digits"
                      value={formData.pin}
                      onChange={(e) => updateField("pin", e.target.value.replace(/\D/g, '').slice(0, 4))}
                    />
                    {errors.pin && <FieldError>{errors.pin}</FieldError>}
                  </Field>

                  <Field>
                    <FieldLabel>
                      Confirm PIN <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="4 digits"
                      value={formData.pinConfirm}
                      onChange={(e) => updateField("pinConfirm", e.target.value.replace(/\D/g, '').slice(0, 4))}
                    />
                    {errors.pinConfirm && <FieldError>{errors.pinConfirm}</FieldError>}
                  </Field>
                </div>
              </div>

              {/* Invite Options */}
              {formData.email && (
                <div className="flex items-start space-x-3 pt-4 border-t">
                  <Checkbox
                    id="sendInvite"
                    checked={formData.sendInvite}
                    onCheckedChange={(checked) => updateField("sendInvite", checked === true)}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="sendInvite" className="font-medium cursor-pointer">
                      Send invitation email
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      We&apos;ll send an email with instructions and the magic link.
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Link href="/technicians" className="flex-1">
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
                      Adding...
                    </>
                  ) : (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      Add Technician
                    </>
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
