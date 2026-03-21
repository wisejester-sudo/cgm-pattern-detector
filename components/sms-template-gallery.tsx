"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Search, 
  Calendar, 
  Truck, 
  Wrench, 
  MessageCircle, 
  CalendarDays, 
  AlertTriangle, 
  FileText,
  CreditCard,
  Star,
  ChevronRight,
  X,
  Check,
  Sparkles
} from "lucide-react"
import { smsTemplateCategories, allTemplates, popularTemplates, searchTemplates, type SMSTemplate } from "@/lib/sms-templates-data"
import { cn } from "@/lib/utils"

interface SMSTemplateGalleryProps {
  onSelectTemplate: (template: SMSTemplate) => void
  selectedTemplateId?: string
}

const categoryIcons: Record<string, React.ReactNode> = {
  appointments: <Calendar className="h-4 w-4" />,
  technician: <Truck className="h-4 w-4" />,
  service: <Wrench className="h-4 w-4" />,
  followup: <MessageCircle className="h-4 w-4" />,
  maintenance: <CalendarDays className="h-4 w-4" />,
  emergency: <AlertTriangle className="h-4 w-4" />,
  quotes: <FileText className="h-4 w-4" />,
  billing: <CreditCard className="h-4 w-4" />,
}

export function SMSTemplateGallery({ onSelectTemplate, selectedTemplateId }: SMSTemplateGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [previewTemplate, setPreviewTemplate] = useState<SMSTemplate | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "popular">("popular")

  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    let templates = allTemplates

    // Apply category filter
    if (selectedCategory !== "all") {
      if (selectedCategory === "popular") {
        templates = popularTemplates
      } else {
        templates = templates.filter(t => t.category === selectedCategory)
      }
    }

    // Apply search filter
    if (searchQuery.trim()) {
      templates = searchTemplates(searchQuery)
      // Re-apply category filter after search if needed
      if (selectedCategory !== "all" && selectedCategory !== "popular") {
        templates = templates.filter(t => t.category === selectedCategory)
      }
    }

    return templates
  }, [searchQuery, selectedCategory])

  // Get current category info
  const currentCategory = smsTemplateCategories.find(c => c.id === selectedCategory)

  return (
    <div className="space-y-4">
      {/* Header with Search */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates (e.g., 'reminder', 'complete', 'emergency')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === "popular" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("popular")}
            className={cn(
              "gap-1.5",
              selectedCategory === "popular" && "bg-amber-500 hover:bg-amber-600"
            )}
          >
            <Star className="h-3.5 w-3.5" />
            Popular
            <Badge variant="secondary" className="ml-1 text-xs">
              {popularTemplates.length}
            </Badge>
          </Button>

          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            All Templates
            <Badge variant="secondary" className="ml-1 text-xs">
              {allTemplates.length}
            </Badge>
          </Button>

          {smsTemplateCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="gap-1.5"
            >
              {categoryIcons[category.id]}
              {category.name}
              <Badge variant="secondary" className="ml-1 text-xs">
                {category.templates.length}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {searchQuery ? (
            <>Found {filteredTemplates.length} templates for "{searchQuery}"</>
          ) : currentCategory ? (
            <>{currentCategory.description}</>
          ) : (
            <>All {allTemplates.length} templates</>
          )}
        </span>
      </div>

      {/* Templates Grid */}
      <ScrollArea className="h-[400px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedTemplateId === template.id && "ring-2 ring-primary"
              )}
              onClick={() => setPreviewTemplate(template)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {template.isPopular && (
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    )}
                    <CardTitle className="text-sm font-medium">
                      {template.name}
                    </CardTitle>
                  </div>
                  {selectedTemplateId === template.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {template.description}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground line-clamp-2 bg-muted p-2 rounded">
                  {template.template_body.substring(0, 100)}...
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No templates found matching "{searchQuery}"</p>
            <Button 
              variant="link" 
              onClick={() => {setSearchQuery(""); setSelectedCategory("all")}}
            >
              Clear filters
            </Button>
          </div>
        )}
      </ScrollArea>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewTemplate?.isPopular && (
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              )}
              {previewTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              {previewTemplate?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Template Preview */}
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">
                {previewTemplate?.template_body}
              </p>
            </div>

            {/* Available Variables */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Dynamic Variables
              </h4>
              <div className="flex flex-wrap gap-1">
                {["{customer_name}", "{job_type}", "{tech_name}", "{scheduled_time}", "{company_phone}"].map((variable) => (
                  <Badge key={variable} variant="outline" className="text-xs font-mono">
                    {variable}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-sm font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {previewTemplate?.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                className="flex-1"
                onClick={() => {
                  if (previewTemplate) {
                    onSelectTemplate(previewTemplate)
                    setPreviewTemplate(null)
                  }
                }}
              >
                <Check className="mr-2 h-4 w-4" />
                Use This Template
              </Button>
              <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
