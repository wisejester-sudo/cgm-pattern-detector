"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useStore } from "@/lib/store"
import { toast } from "sonner"
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Palette, 
  AlertTriangle, 
  Loader2, 
  CheckCircle2,
  RefreshCw,
  Trash2,
  Clock
} from "lucide-react"
import { z } from "zod"

// Validation schemas
const companySchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  companyPhone: z.string().min(10, "Please enter a valid phone number"),
  companyEmail: z.string().email("Please enter a valid email"),
  address: z.string().min(5, "Please enter a valid address"),
  city: z.string().min(2, "Please enter a valid city"),
  state: z.string().min(2, "Please enter a valid state"),
  zip: z.string().min(5, "Please enter a valid ZIP code"),
  timezone: z.string().min(1, "Please select a timezone"),
})

type CompanyFormData = z.infer<typeof companySchema>

export default function CompanySettingsPage() {
  const router = useRouter()
  const { companySettings, loadCompanySettings } = useStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isProvisioning, setIsProvisioning] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [activeTab, setActiveTab] = useState("company")
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})

  const [companyData, setCompanyData] = useState<CompanyFormData>({
    companyName: "",
    companyPhone: "",
    companyEmail: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    timezone: "America/New_York",
  })

  // Load data
  useEffect(() => {
    const loadData = async () => {
      await loadCompanySettings()
      setIsLoading(false)
    }
    loadData()
  }, [loadCompanySettings])

  // Update form when settings load
  useEffect(() => {
    if (companySettings) {
      setCompanyData({
        companyName: companySettings.company_name || "",
        companyPhone: companySettings.company_phone || "",
        companyEmail: companySettings.company_email || "",
        address: companySettings.address || "",
        city: companySettings.city || "",
        state: companySettings.state || "",
        zip: companySettings.zip || "",
        timezone: companySettings.timezone || "America/New_York",
      })
    }
  }, [companySettings])

  const timezones = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "America/Anchorage", label: "Alaska Time (AKT)" },
    { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
  ]

  const validateCompany = (): boolean => {
    try {
      companySchema.parse(companyData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<string, string>> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleSaveCompany = async () => {
    if (!validateCompany()) {
      toast.error("Please fix the errors in the form")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyData.companyName,
          company_phone: companyData.companyPhone,
          company_email: companyData.companyEmail,
          address: companyData.address,
          city: companyData.city,
          state: companyData.state,
          zip: companyData.zip,
          timezone: companyData.timezone,
        }),
      })
      
      if (!response.ok) throw new Error('Failed to save settings')
      
      toast.success("Company settings saved")
      await loadCompanySettings()
    } catch (error) {
      console.error("[CompanySettingsPage] Error saving:", error)
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleProvisionNumber = async () => {
    setIsProvisioning(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'provision' }),
      })
      
      if (!response.ok) throw new Error('Failed to provision')
      
      const data = await response.json()
      toast.success(`Phone number provisioned: ${data.phoneNumber}`)
      await loadCompanySettings()
    } catch (error) {
      console.error("[CompanySettingsPage] Error provisioning:", error)
      toast.error("Failed to provision phone number")
    } finally {
      setIsProvisioning(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm")
      return
    }

    try {
      const response = await fetch('/api/settings', {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete account')
      
      toast.success("Account deletion scheduled. You will be logged out.")
      setShowDeleteDialog(false)
      router.push('/')
    } catch (error) {
      console.error("[CompanySettingsPage] Error deleting:", error)
      toast.error("Failed to delete account")
    }
  }

  const updateCompanyField = (field: keyof CompanyFormData, value: string) => {
    setCompanyData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Company Settings</h1>
        <p className="text-muted-foreground">Manage your company profile and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="company">Company Info</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="phone">Phone Number</TabsTrigger>
        </TabsList>

        {/* Company Info Tab */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                Update your company details. This information will appear on customer communications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Company Name</Label>
                  <Input
                    value={companyData.companyName}
                    onChange={(e) => updateCompanyField("companyName", e.target.value)}
                  />
                  {errors.companyName && <p className="text-sm text-destructive mt-1">{errors.companyName}</p>}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Company Phone
                    </Label>
                    <Input
                      value={companyData.companyPhone}
                      onChange={(e) => updateCompanyField("companyPhone", e.target.value)}
                    />
                    {errors.companyPhone && <p className="text-sm text-destructive mt-1">{errors.companyPhone}</p>}
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Company Email
                    </Label>
                    <Input
                      type="email"
                      value={companyData.companyEmail}
                      onChange={(e) => updateCompanyField("companyEmail", e.target.value)}
                    />
                    {errors.companyEmail && <p className="text-sm text-destructive mt-1">{errors.companyEmail}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Business Address
                  </h4>
                  
                  <div>
                    <Label>Street Address</Label>
                    <Input
                      value={companyData.address}
                      onChange={(e) => updateCompanyField("address", e.target.value)}
                    />
                    {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label>City</Label>
                      <Input
                        value={companyData.city}
                        onChange={(e) => updateCompanyField("city", e.target.value)}
                      />
                      {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input
                        value={companyData.state}
                        onChange={(e) => updateCompanyField("state", e.target.value)}
                      />
                      {errors.state && <p className="text-sm text-destructive mt-1">{errors.state}</p>}
                    </div>
                    <div>
                      <Label>ZIP Code</Label>
                      <Input
                        value={companyData.zip}
                        onChange={(e) => updateCompanyField("zip", e.target.value)}
                      />
                      {errors.zip && <p className="text-sm text-destructive mt-1">{errors.zip}</p>}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Timezone
                  </Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={companyData.timezone}
                    onChange={(e) => updateCompanyField("timezone", e.target.value)}
                  >
                    {timezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleSaveCompany}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Branding
              </CardTitle>
              <CardDescription>
                Customize your company&apos;s appearance in the app and communications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={companySettings?.primary_color || "#3b82f6"}
                      onChange={(e) => {/* TODO: handle color change */}}
                      className="h-10 w-20 rounded border"
                    />
                    <Input
                      value={companySettings?.primary_color || "#3b82f6"}
                      className="flex-1"
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                <div>
                  <Label>Company Logo</Label>
                  <div className="mt-2 p-6 border-2 border-dashed rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Logo upload coming soon</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Phone Number Tab */}
        <TabsContent value="phone" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Phone Number
              </CardTitle>
              <CardDescription>
                Manage your Dispatchly phone number for SMS messaging.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {companySettings?.twilio_number ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Phone Number Active</p>
                      <p className="text-green-700 font-mono">{companySettings.twilio_number}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>Your phone number is ready to send and receive SMS messages.</p>
                    <p>Status: <Badge variant="outline" className="capitalize">{companySettings.number_status}</Badge></p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-6 border-2 border-dashed rounded-lg text-center">
                    <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No Phone Number</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Provision a phone number to start sending SMS messages to customers and technicians.
                    </p>
                    <Button 
                      onClick={handleProvisionNumber}
                      disabled={isProvisioning}
                    >
                      {isProvisioning ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Provisioning...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Provision Phone Number
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Danger Zone */}
      <Card className="mt-8 border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Destructive actions that cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-destructive/5 rounded-lg">
            <div>
              <h4 className="font-medium text-destructive">Delete Account</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
            </div>
            <Button 
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This will permanently delete your account, all jobs, technicians, and settings. 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm">
              Type <strong>DELETE</strong> to confirm:
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "DELETE"}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
