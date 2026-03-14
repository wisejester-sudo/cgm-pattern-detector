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
import { Button } from "@/components/ui/button"
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
  const { templates, settings, addTemplate, updateTemplate, deleteTemplate, updateSettings } =
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
  const [ownerName, setOwnerName] = useState("")
  const [ownerPhone, setOwnerPhone] = useState("")
  const [ownerEmail, setOwnerEmail] = useState("")
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/auth/user-profile')
        if (response.ok) {
          const data = await response.json()
          setUserProfile(data)
          setOwnerName(data.full_name || "")
          setOwnerPhone(data.phone || "")
          setOwnerEmail(data.email || "")
          // Pre-fill company fields from user metadata if settings are empty
          if (!companyName && data.company_name) {
            setCompanyName(data.company_name)
          }
          if (!companyPhone && data.company_phone) {
            setCompanyPhone(data.company_phone)
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
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

  const handleSaveSettings = () => {
    updateSettings({
      company_name: companyName,
      company_phone: companyPhone,
    })
    setSettingsSaved(true)
    toast.success('Company info saved')
    setTimeout(() => setSettingsSaved(false), 2000)
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
      .replace(/{job_type}/g, "AC Repair")
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
        <CardHeader>
          <CardTitle>Account Owner Profile</CardTitle>
          <CardDescription>
            Your personal account information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profileLoading ? (
            <p className="text-muted-foreground">Loading profile...</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="ownerName">Full Name</FieldLabel>
                <Input
                  id="ownerName"
                  value={ownerName}
                  disabled
                  className="bg-muted"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="ownerEmail">Email</FieldLabel>
                <Input
                  id="ownerEmail"
                  type="email"
                  value={ownerEmail}
                  disabled
                  className="bg-muted"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="ownerPhone">Phone Number</FieldLabel>
                <Input
                  id="ownerPhone"
                  value={ownerPhone}
                  disabled
                  className="bg-muted"
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
          )}
          <p className="text-xs text-muted-foreground mt-4">
            To update your profile information, contact support or sign in with updated details.
          </p>
        </CardContent>
      </Card>

      {/* Company Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Update your company details used in SMS messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="companyName">Company Name</FieldLabel>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="companyPhone">Company Phone</FieldLabel>
              <Input
                id="companyPhone"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
              />
            </Field>
          </div>
          <Button onClick={handleSaveSettings} className="mt-4">
            {settingsSaved ? "Saved!" : "Save Company Info"}
          </Button>
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
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
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
                  <Button
                    onClick={handleAddTemplate}
                    disabled={!newTemplateName || !newTemplateBody}
                  >
                    Create Template
                  </Button>
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

                <Button onClick={handleSaveTemplate} className="w-full">
                  Save Template
                </Button>
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
