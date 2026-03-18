"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { useStore } from "@/lib/store"
import { Plus, MoreVertical, Copy, Loader2, Check, X, MessageSquare } from "lucide-react"

const variables = [
  { name: "{customer_name}", description: "Customer's full name" },
  { name: "{tech_name}", description: "Technician's name" },
  { name: "{job_type}", description: "Type of job" },
  { name: "{address}", description: "Job address" },
  { name: "{eta}", description: "Estimated time of arrival" },
  { name: "{company_name}", description: "Your company name" },
  { name: "{company_phone}", description: "Company phone number" },
]

export function TemplatesSection() {
  const { templates, addTemplate, updateTemplate, deleteTemplate, settings } = useStore()
  
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)
  const [templateName, setTemplateName] = useState("")
  const [templateBody, setTemplateBody] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState("")
  const [newTemplateBody, setNewTemplateBody] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleInsertVariable = (variable: string, isNew: boolean) => {
    if (isNew) {
      setNewTemplateBody((prev) => prev + variable)
    } else {
      setTemplateBody((prev) => prev + variable)
    }
  }

  const handleAddTemplate = async () => {
    if (!newTemplateName.trim() || !newTemplateBody.trim()) {
      toast.error("Template name and body are required")
      return
    }

    setIsSaving(true)
    
    try {
      addTemplate({
        name: newTemplateName.trim(),
        template_body: newTemplateBody.trim(),
      })
      
      toast.success("Template created")
      setIsAddOpen(false)
      setNewTemplateName("")
      setNewTemplateBody("")
    } catch (error) {
      console.error("Failed to add template:", error)
      toast.error("Failed to create template")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateTemplate = async (id: string) => {
    if (!templateName.trim() || !templateBody.trim()) {
      toast.error("Template name and body are required")
      return
    }

    setIsSaving(true)
    
    try {
      updateTemplate(id, {
        name: templateName.trim(),
        template_body: templateBody.trim(),
      })
      
      toast.success("Template updated")
      setEditingTemplate(null)
    } catch (error) {
      console.error("Failed to update template:", error)
      toast.error("Failed to update template")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    setIsDeleting(id)
    
    try {
      deleteTemplate(id)
      toast.success("Template deleted")
    } catch (error) {
      console.error("Failed to delete template:", error)
      toast.error("Failed to delete template")
    } finally {
      setIsDeleting(null)
    }
  }

  const startEditing = (template: typeof templates[0]) => {
    setEditingTemplate(template.id)
    setTemplateName(template.name)
    setTemplateBody(template.template_body)
  }

  const cancelEditing = () => {
    setEditingTemplate(null)
    setTemplateName("")
    setTemplateBody("")
  }

  const renderPreview = (template: string) => {
    return template
      .replace(/{customer_name}/g, "Sarah Johnson")
      .replace(/{tech_name}/g, "Mike")
      .replace(/{job_type}/g, "HVAC Repair")
      .replace(/{address}/g, "123 Main Street")
      .replace(/{company_name}/g, settings.company_name || "Your Company")
      .replace(/{company_phone}/g, settings.company_phone || "555-0123")
      .replace(/{eta}/g, "15-20 minutes")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>SMS Templates</CardTitle>
            <CardDescription>
              Create and manage templates for text messages
            </CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
                <DialogDescription>
                  Create a reusable SMS template for your technicians
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Template Name</label>
                  <Input
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="e.g., En Route Notification"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Message Body</label>
                  <Textarea
                    value={newTemplateBody}
                    onChange={(e) => setNewTemplateBody(e.target.value)}
                    placeholder="Enter your message template..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {newTemplateBody.length} characters
                    {newTemplateBody.length > 160 && (
                      <span className="text-amber-500"> (will send as multiple messages)</span>
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Available Variables</label>
                  <div className="flex flex-wrap gap-2">
                    {variables.map((variable) => (
                      <button
                        key={variable.name}
                        type="button"
                        onClick={() => handleInsertVariable(variable.name, true)}
                        className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded transition-colors"
                        title={variable.description}
                      >
                        {variable.name}
                      </button>
                    ))}
                  </div>
                </div>

                {newTemplateBody && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Preview</label>
                    <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                      {renderPreview(newTemplateBody)}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddTemplate}
                  disabled={isSaving || !newTemplateName.trim() || !newTemplateBody.trim()}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Template"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No templates yet</p>
              <p className="text-sm">Create your first SMS template to get started</p>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className="border rounded-lg p-4 space-y-3"
              >
                {editingTemplate === template.id ? (
                  // Edit mode
                  <div className="space-y-4">
                    <Input
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Template name"
                    />
                    <Textarea
                      value={templateBody}
                      onChange={(e) => setTemplateBody(e.target.value)}
                      placeholder="Template body"
                      rows={3}
                    />
                    <div className="flex flex-wrap gap-2">
                      {variables.map((variable) => (
                        <button
                          key={variable.name}
                          type="button"
                          onClick={() => handleInsertVariable(variable.name, false)}
                          className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded"
                        >
                          {variable.name}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateTemplate(template.id)}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 mr-1" />
                        )}
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEditing}
                        disabled={isSaving}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{template.name}</h4>
                          {template.id.startsWith('default') && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {template.template_body}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {template.template_body.length} characters
                          {template.template_body.length > 160 && (
                            <span> (multi-part)</span>
                          )}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startEditing(template)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {!template.id.startsWith('default') && (
                            <DropdownMenuItem
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="text-destructive"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
