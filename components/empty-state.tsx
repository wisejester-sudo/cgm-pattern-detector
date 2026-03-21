"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Plus, Search, Inbox, ClipboardList, Users, Camera } from "lucide-react"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
        {icon && (
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            {icon}
          </div>
        )}
        
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {description}
        </p>
        
        {action && (
          <Button
            onClick={action.onClick}
            className="touch-target"
          >
            {action.icon || <Plus className="h-4 w-4 mr-2" />}
            {action.label}
          </Button>
        )}
        
        {secondaryAction && (
          <Button
            variant="link"
            onClick={secondaryAction.onClick}
            className="mt-2"
          >
            {secondaryAction.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// Pre-configured empty states for common scenarios
export function EmptyJobs({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      icon={<ClipboardList className="h-8 w-8 text-muted-foreground" />}
      title="No jobs yet"
      description="Get started by creating your first job. Add customer details, schedule a time, and assign a technician."
      action={{
        label: "Create Job",
        onClick: onCreate,
        icon: <Plus className="h-4 w-4 mr-2" />,
      }}
    />
  )
}

export function EmptyTechnicians({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={<Users className="h-8 w-8 text-muted-foreground" />}
      title="No technicians yet"
      description="Add your team members to start dispatching jobs. They'll receive magic links via SMS to access their assigned jobs."
      action={{
        label: "Add Technician",
        onClick: onAdd,
        icon: <Plus className="h-4 w-4 mr-2" />,
      }}
    />
  )
}

export function EmptyPhotos({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={<Camera className="h-8 w-8 text-muted-foreground" />}
      title="No photos yet"
      description="Document the job with before, during, and after photos. Customers can view these through their tracking link."
      action={{
        label: "Add Photo",
        onClick: onAdd,
        icon: <Plus className="h-4 w-4 mr-2" />,
      }}
    />
  )
}

export function EmptySearch({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <EmptyState
      icon={<Search className="h-8 w-8 text-muted-foreground" />}
      title={`No results for "${query}"`}
      description="Try searching for a different customer name, phone number, or address."
      action={{
        label: "Clear Search",
        onClick: onClear,
      }}
    />
  )
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon={<Inbox className="h-8 w-8 text-muted-foreground" />}
      title="No notifications"
      description="You'll see updates here when customers reply, jobs change status, or technicians add notes."
    />
  )
}

export function EmptyTechJobs() {
  return (
    <EmptyState
      icon={<ClipboardList className="h-8 w-8 text-muted-foreground" />}
      title="No jobs assigned"
      description="You're all caught up! When your dispatcher assigns you a job, it will appear here."
    />
  )
}
