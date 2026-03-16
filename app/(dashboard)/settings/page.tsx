"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button, BrandButton } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, MoreVertical, Copy, ExternalLink } from "lucide-react"
import { useStore } from "@/lib/store"
import Link from "next/link"

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  company_name: string | null
  company_phone: string | null
  role: 'admin' | 'technician'
}

const variables = [
  { name: "{customer_name}", description: "Customer's full name" },
  { name: "{tech_name}", description: "Technician's name" },
  { name: "{job_type}", description: "Type of job" },
  { name: "{address}", description: "Job address" },
  { name: "{eta}", description: "Estimated time of arrival" },
  { name: "{company_name}", description: "Your company name" },
  { name: "{company_phone}", description: "Company phone number" },
]

export default function SettingsPage() {
  const { templates, settings, addTemplate, updateTemplate, deleteTemplate, updateSettings, initializeUserFromSupabase } =
    useStore()

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)
  const [templateBody, setTemplateBody] = useState("")
  const [templateName, setTemplateName] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState("")
  const [newTemplateBody, setNewTemplateBody] = useState("")
  const [companyName, setCompanyName] = useState(settings.company_name)
  const [companyPhone, setCompanyPhone] = useState(settings.company_phone)
  const [primaryColor, setPrimaryColor] = useState(settings.primary_color || '#3b82f6')
  const [tagline, setTagline] = useState(settings.tagline || '')
  const [businessHours, setBusinessHours] = useState(settings.business_hours || '')
  const [serviceArea, setServiceArea] = useState(settings.service_area || '')
  const [logoUrl, setLogoUrl] = useState(settings.logo_url || '')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [customJobTypes, setCustomJobTypes] = useState<string[]>(settings.custom_job_types || [])
  const [newJobType, setNewJobType] = useState('')
  const [originalCompanyName, setOriginalCompanyName] = useState(settings.company_name)
  const [originalCompanyPhone, setOriginalCompanyPhone] = useState(settings.company_phone)
  const [originalPrimaryColor, setOriginalPrimaryColor] = useState(settings.primary_color || '#3b82f6')
  const [originalTagline, setOriginalTagline] = useState(settings.tagline || '')
  const [originalBusinessHours, setOriginalBusinessHours] = useState(settings.business_hours || '')
  const [originalServiceArea, setOriginalServiceArea] = useState(settings.service_area || '')
  const [isEditingCompany, setIsEditingCompany] = useState(false)
  const [companySaving, setCompanySaving] = useState(false)
  const [companySaved, setCompanySaved] = useState(false)
  const [ownerName, setOwnerName] = useState("")
  const [ownerPhone, setOwnerPhone] = useState("")
  const [ownerEmail, setOwnerEmail] = useState("")
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Add timeout to prevent infinite loading
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
        
        const response = await fetch('/api/auth/user-profile', {
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const data = await response.json()
          setUserProfile(data)
          setOwnerName(data.full_name || data.name || "")
          setOwnerPhone(data.phone || "")
          setOwnerEmail(data.email || "")
          setProfileError(null)
          // Pre-fill company fields from user metadata if settings are empty
          if (!companyName && data.company_name) {
            setCompanyName(data.company_name)
          }
          if (!companyPhone && data.company_phone) {
            setCompanyPhone(data.company_phone)
          }
        } else {
          const errorData = await response.json().catch(() => ({}))
          setProfileError(errorData.error || `Failed to load profile: ${response.status}`)
        }
      } catch (error: any) {
        console.error('Failed to fetch profile:', error)
        if (error.name === 'AbortError') {
          setProfileError('Profile load timed out. Please try again.')
        } else {
          setProfileError('Failed to load profile. Please check your connection.')
        }
      } finally {
        setProfileLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleEditTemplate = (id: string) => {
    const template = templates.find((t) => t.id === id)
    if (template) {
      setEditingTemplate(id)
      setTemplateBody(template.template_body)
      setTemplateName(template.name)
    }
  }

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      updateTemplate(editingTemplate, {
        name: templateName,
        template_body: templateBody,
      })
      setEditingTemplate(null)
      toast.success('Template saved')
    }
  }

  const handleAddTemplate = () => {
    addTemplate({
      name: newTemplateName,
      template_body: newTemplateBody,
    })
    setNewTemplateName("")
    setNewTemplateBody("")
    setIsAddOpen(false)
    toast.success(`Template "${newTemplateName}" created`)
  }

  const handleDeleteTemplate = (id: string) => {
    deleteTemplate(id)
    if (editingTemplate === id) {
      setEditingTemplate(null)
    }
    toast.success('Template deleted')
  }

  const handleSaveSettings = async () => {
    setCompanySaving(true)
    try {
      let finalLogoUrl = logoUrl
      
      // Upload logo if there's a new file
      if (logoFile) {
        const formData = new FormData()
        formData.append('file', logoFile)
        
        const response = await fetch('/api/upload/logo', {
          method: 'POST',
          body: formData,
        })
        
        if (response.ok) {
          const data = await response.json()
          finalLogoUrl = data.logoUrl
          setLogoUrl(finalLogoUrl)
        } else {
          console.error('Failed to upload logo')
          toast.error('Failed to upload logo')
        }
      }
      
      await updateSettings({
        company_name: companyName,
        company_phone: companyPhone,
        primary_color: primaryColor,
        tagline: tagline,
        business_hours: businessHours,
        service_area: serviceArea,
        logo_url: finalLogoUrl,
        custom_job_types: customJobTypes,
      })
      setOriginalCompanyName(companyName)
      setOriginalCompanyPhone(companyPhone)
      setOriginalPrimaryColor(primaryColor)
      setOriginalTagline(tagline)
      setOriginalBusinessHours(businessHours)
      setOriginalServiceArea(serviceArea)
      setCompanySaved(true)
      setIsEditingCompany(false)
      toast.success('Company info saved')
      setTimeout(() => setCompanySaved(false), 2000)
    } catch (error) {
      console.error('Failed to save company settings:', error)
      toast.error('Failed to save company info')
    } finally {
      setCompanySaving(false)
    }
  }

  const handleCancelCompanyEdit = () => {
    setCompanyName(originalCompanyName)
    setCompanyPhone(originalCompanyPhone)
    setPrimaryColor(originalPrimaryColor)
    setTagline(originalTagline)
    setBusinessHours(originalBusinessHours)
    setServiceArea(originalServiceArea)
    setIsEditingCompany(false)
  }

  const handleAddJobType = () => {
    if (newJobType.trim() && !customJobTypes.includes(newJobType.trim())) {
      setCustomJobTypes([...customJobTypes, newJobType.trim()])
      setNewJobType('')
    }
  }

  const handleRemoveJobType = (type: string) => {
    setCustomJobTypes(customJobTypes.filter(t => t !== type))
  }

  const handleSaveProfile = async () => {
    setProfileSaving(true)
    try {
      const response = await fetch('/api/auth/user-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ownerName,
          email: ownerEmail,
          phone: ownerPhone,
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setProfileSaved(true)
        setIsEditingProfile(false)
        toast.success('Profile updated successfully')
        // Update local state with returned profile
        if (data.profile) {
          setOwnerName(data.profile.full_name || data.profile.name || '')
          setOwnerEmail(data.profile.email || '')
          setOwnerPhone(data.profile.phone || '')
        }
        // Refresh store data to update header and navigation
        await initializeUserFromSupabase()
        setTimeout(() => setProfileSaved(false), 2000)
      } else {
        console.error('[Frontend] Profile update failed:', data)
        toast.error(`Error: ${data.error || 'Failed to update profile'}${data.details ? ` - ${data.details}` : ''}`)
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditingProfile(false)
    // Reload profile data to discard changes
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/auth/user-profile')
        if (response.ok) {
          const data = await response.json()
          setOwnerName(data.full_name || data.name || "")
          setOwnerPhone(data.phone || "")
          setOwnerEmail(data.email || "")
        }
      } catch (error) {
        console.error('Failed to reload profile:', error)
      }
    }
    fetchProfile()
  }

  const insertVariable = (variable: string, isNew: boolean = false) => {
    if (isNew) {
      setNewTemplateBody((prev) => prev + variable)
    } else {
      setTemplateBody((prev) => prev + variable)
    }
  }

  const currentTemplate = editingTemplate
    ? templates.find((t) => t.id === editingTemplate)
    : null

  const previewMessage = (template: string) =>
    template
      .replace(/{customer_name}/g, "Sarah Johnson")
      .replace(/{tech_name}/g, "Mike")
      .replace(/{job_type}/g, "Service Call")
      .replace(/{address}/g, "123 Oak Street")
      .replace(/{company_name}/g, companyName)
      .replace(/{company_phone}/g, companyPhone)
      .replace(/{eta}/g, "15-20 minutes")

  const characterCount = editingTemplate ? templateBody.length : 0
  const smsLimit = 160

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Configure your account and SMS templates
        </p>
      </div>

      {/* Owner Profile Section */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Account Owner Profile</CardTitle>
            <CardDescription>
              {isEditingProfile ? 'Edit your personal account information' : 'Your personal account information'}
            </CardDescription>
          </div>
          {!isEditingProfile && !profileLoading && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditingProfile(true)}
            >
              Edit Profile
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {profileLoading ? (
            <p className="text-muted-foreground">Loading profile...</p>
          ) : profileError ? (
            <div className="text-center py-4">
              <p className="text-destructive mb-2">{profileError}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Retry
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="ownerName">Full Name</FieldLabel>
                  <Input
                    id="ownerName"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Your full name"
                    disabled={!isEditingProfile}
                    className={!isEditingProfile ? "bg-muted" : ""}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="ownerEmail">Email</FieldLabel>
                  <Input
                    id="ownerEmail"
                    type="email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="you@company.com"
                    disabled={!isEditingProfile}
                    className={!isEditingProfile ? "bg-muted" : ""}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="ownerPhone">Phone Number</FieldLabel>
                  <Input
                    id="ownerPhone"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    disabled={!isEditingProfile}
                    className={!isEditingProfile ? "bg-muted" : ""}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="userRole">Role</FieldLabel>
                  <div className="flex items-center gap-2 pt-2">
                    <Badge variant="secondary" className="capitalize">
                      {userProfile?.role || "admin"}
                    </Badge>
                  </div>
                </Field>
              </div>
              {isEditingProfile && (
                <div className="flex gap-2 mt-4">
                  <BrandButton 
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                  >
                    {profileSaving ? 'Saving...' : 'Save Profile'}
                  </BrandButton>
                  <Button 
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={profileSaving}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Company Settings */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              {isEditingCompany ? 'Edit your company details used in SMS messages' : 'Your company details used in SMS messages'}
            </CardDescription>
          </div>
          {!isEditingCompany && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditingCompany(true)}
            >
              Edit Company
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="companyName">Company Name</FieldLabel>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={!isEditingCompany}
                className={!isEditingCompany ? "bg-muted" : ""}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="companyPhone">Company Phone</FieldLabel>
              <Input
                id="companyPhone"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                disabled={!isEditingCompany}
                className={!isEditingCompany ? "bg-muted" : ""}
              />
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel>Company Logo</FieldLabel>
              <div className="flex items-center gap-4">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Company logo"
                    className="h-16 w-16 object-contain border rounded p-1"
                  />
                )}
                {isEditingCompany && (
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setLogoFile(file)
                          // Preview
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setLogoUrl(reader.result as string)
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Max 2MB, PNG or JPG
                    </p>
                  </div>
                )}
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor="primaryColor">Brand Color</FieldLabel>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="primaryColor"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  disabled={!isEditingCompany}
                  className="w-10 h-10 rounded cursor-pointer disabled:cursor-not-allowed"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  disabled={!isEditingCompany}
                  className={!isEditingCompany ? "bg-muted flex-1" : "flex-1"}
                  placeholder="#3b82f6"
                />
              </div>
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="tagline">Tagline</FieldLabel>
              <Input
                id="tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                disabled={!isEditingCompany}
                className={!isEditingCompany ? "bg-muted" : ""}
                placeholder="Your company tagline"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="businessHours">Business Hours</FieldLabel>
              <Input
                id="businessHours"
                value={businessHours}
                onChange={(e) => setBusinessHours(e.target.value)}
                disabled={!isEditingCompany}
                className={!isEditingCompany ? "bg-muted" : ""}
                placeholder="Mon-Fri 8am-6pm"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="serviceArea">Service Area</FieldLabel>
              <Input
                id="serviceArea"
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                disabled={!isEditingCompany}
                className={!isEditingCompany ? "bg-muted" : ""}
                placeholder="City, State or Region"
              />
            </Field>
          </div>
          {isEditingCompany && (
            <div className="flex gap-2 mt-4">
              <BrandButton 
                onClick={handleSaveSettings}
                disabled={companySaving}
              >
                {companySaving ? 'Saving...' : companySaved ? 'Saved!' : 'Save Company Info'}
              </BrandButton>
              <Button 
                variant="outline"
                onClick={handleCancelCompanyEdit}
                disabled={companySaving}
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Types */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Job Types</CardTitle>
            <CardDescription>
              Manage custom job types for your business
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {customJobTypes.map((type) => (
                <Badge key={type} variant="secondary" className="flex items-center gap-1">
                  {type}
                  <button
                    onClick={() => handleRemoveJobType(type)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {customJobTypes.length === 0 && (
                <p className="text-sm text-muted-foreground">No custom job types yet</p>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add new job type (e.g., Pool Cleaning)"
                value={newJobType}
                onChange={(e) => setNewJobType(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddJobType()}
              />
              <Button onClick={handleAddJobType} variant="outline">
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Tracking Link */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Job Tracker</CardTitle>
          <CardDescription>
            Share this link with customers so they can track their job status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={typeof window !== "undefined" ? `${window.location.origin}/track/[JOB_ID]` : "/track/[JOB_ID]"}
              className="font-mono text-sm"
            />
            <Link href="/track/demo" target="_blank">
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Replace [JOB_ID] with the actual job ID to create a tracking link
          </p>
        </CardContent>
      </Card>

      {/* SMS Templates */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Template List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>SMS Templates</CardTitle>
              <CardDescription>Manage your message templates</CardDescription>
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <BrandButton>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </BrandButton>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Template</DialogTitle>
                  <DialogDescription>
                    Create a new SMS template for customer notifications
                  </DialogDescription>
                </DialogHeader>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="newTemplateName">Template Name</FieldLabel>
                    <Input
                      id="newTemplateName"
                      placeholder="e.g., Appointment Reminder"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="newTemplateBody">Message</FieldLabel>
                    <Textarea
                      id="newTemplateBody"
                      placeholder="Enter your message template..."
                      value={newTemplateBody}
                      onChange={(e) => setNewTemplateBody(e.target.value)}
                      rows={4}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Variables</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {variables.slice(0, 4).map((v) => (
                        <Button
                          key={v.name}
                          variant="outline"
                          size="sm"
                          onClick={() => insertVariable(v.name, true)}
                        >
                          {v.name}
                        </Button>
                      ))}
                    </div>
                  </Field>
                </FieldGroup>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <BrandButton
                    onClick={handleAddTemplate}
                    disabled={!newTemplateName || !newTemplateBody}
                  >
                    Create Template
                  </BrandButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    editingTemplate === template.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleEditTemplate(template.id)}
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{template.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {template.template_body.slice(0, 50)}...
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditTemplate(template.id)
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTemplate(template.id)
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Template Editor / Preview */}
        <Card>
          <CardHeader>
            <CardTitle>
              {editingTemplate ? "Edit Template" : "Preview"}
            </CardTitle>
            <CardDescription>
              {editingTemplate
                ? "Modify the template content"
                : "Select a template to edit"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {editingTemplate && currentTemplate ? (
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="templateName">Template Name</FieldLabel>
                  <Input
                    id="templateName"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                </Field>
                <Field>
                  <div className="flex items-center justify-between mb-2">
                    <FieldLabel>Message</FieldLabel>
                    <span
                      className={`text-xs ${
                        characterCount > smsLimit
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {characterCount} chars ({Math.ceil(characterCount / smsLimit)}{" "}
                      SMS)
                    </span>
                  </div>
                  <Textarea
                    value={templateBody}
                    onChange={(e) => setTemplateBody(e.target.value)}
                    rows={5}
                    className="font-mono text-sm"
                  />
                </Field>

                <Field>
                  <FieldLabel>Insert Variables</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {variables.map((v) => (
                      <Button
                        key={v.name}
                        variant="outline"
                        size="sm"
                        onClick={() => insertVariable(v.name)}
                        title={v.description}
                      >
                        {v.name}
                      </Button>
                    ))}
                  </div>
                </Field>

                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Preview</p>
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-sm whitespace-pre-wrap">
                      {previewMessage(templateBody)}
                    </p>
                  </div>
                </div>

                <BrandButton onClick={handleSaveTemplate} className="w-full">
                  Save Template
                </BrandButton>
              </FieldGroup>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">
                  Select a template from the list to edit it
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Variables Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Available Variables</CardTitle>
          <CardDescription>
            Use these placeholders in your templates - they will be replaced with
            actual values when the message is sent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {variables.map((v) => (
              <div
                key={v.name}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
              >
                <code className="text-xs bg-background px-2 py-1 rounded font-mono">
                  {v.name}
                </code>
                <span className="text-sm text-muted-foreground">
                  {v.description}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
