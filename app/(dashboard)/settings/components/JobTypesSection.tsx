"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"
import { Plus, X, Briefcase, Loader2 } from "lucide-react"

const defaultJobTypes = [
  "Repair",
  "Maintenance",
  "Installation",
  "Inspection",
  "Emergency",
  "Consultation",
]

export function JobTypesSection() {
  const { settings, updateSettings } = useStore()
  const [customJobTypes, setCustomJobTypes] = useState<string[]>(settings.custom_job_types || [])
  const [newJobType, setNewJobType] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleAddJobType = async () => {
    if (!newJobType.trim()) {
      toast.error("Please enter a job type")
      return
    }

    if (customJobTypes.includes(newJobType.trim())) {
      toast.error("This job type already exists")
      return
    }

    const updatedTypes = [...customJobTypes, newJobType.trim()]
    
    setIsSaving(true)
    try {
      await updateSettings({ custom_job_types: updatedTypes })
      setCustomJobTypes(updatedTypes)
      setNewJobType("")
      toast.success("Job type added")
    } catch (error) {
      console.error("Failed to add job type:", error)
      toast.error("Failed to add job type")
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveJobType = async (type: string) => {
    const updatedTypes = customJobTypes.filter((t) => t !== type)
    
    setIsSaving(true)
    try {
      await updateSettings({ custom_job_types: updatedTypes })
      setCustomJobTypes(updatedTypes)
      toast.success("Job type removed")
    } catch (error) {
      console.error("Failed to remove job type:", error)
      toast.error("Failed to remove job type")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Job Types</CardTitle>
            <CardDescription>
              Manage custom job types for your business
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Default Job Types */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Default Job Types
            </h4>
            <div className="flex flex-wrap gap-2">
              {defaultJobTypes.map((type) => (
                <Badge
                  key={type}
                  variant="secondary"
                  className="px-3 py-1"
                >
                  {type}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              These are always available and cannot be removed
            </p>
          </div>

          {/* Custom Job Types */}
          <div>
            <h4 className="text-sm font-medium mb-3">Custom Job Types</h4>
            
            {customJobTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground mb-4">
                No custom job types yet. Add your first one below.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 mb-4">
                {customJobTypes.map((type) => (
                  <Badge
                    key={type}
                    variant="outline"
                    className="px-3 py-1 flex items-center gap-1 group"
                  >
                    {type}
                    <button
                      type="button"
                      onClick={() => handleRemoveJobType(type)}
                      disabled={isSaving}
                      className="ml-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                      title="Remove job type"
                    >
                      {isSaving ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Add New Job Type */}
            <div className="flex gap-2">
              <Input
                value={newJobType}
                onChange={(e) => setNewJobType(e.target.value)}
                placeholder="Enter new job type (e.g., Tune-up)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddJobType()
                  }
                }}
                disabled={isSaving}
              />
              <Button
                onClick={handleAddJobType}
                disabled={isSaving || !newJobType.trim()}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter or click Add to create a new job type
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
