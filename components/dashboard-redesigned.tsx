"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useStore, getTechnicianById } from "@/lib/store"
import { JobCreationWizard } from "./job-creation-wizard"
import { CommandPalette } from "./command-palette"
import {
  EmptyJobs,
  EmptyNotifications,
  SkeletonStats,
  SkeletonList,
} from "./empty-state"
import { toast } from "sonner"
import {
  Plus,
  Briefcase,
  Clock,
  Truck,
  CheckCircle,
  Users,
  MessageSquare,
  BarChart3,
  MapPin,
  AlertCircle,
  Calendar,
  ChevronRight,
  Zap,
  TrendingUp,
  Bell,
} from "lucide-react"
import type { JobStatus } from "@/lib/types"
import { isSameDayLocal, getTodayLocal, formatDistanceToNow } from "@/lib/date-utils"
import Link from "next/link"
import { cn } from "@/lib/utils"

const statusConfig: Record<JobStatus, { label: string; className: string; icon: React.ElementType }> = {
  available: { label: "Available", className: "bg-blue-100 text-blue-800", icon: Briefcase },
  scheduled: { label: "Scheduled", className: "bg-status-scheduled text-foreground", icon: Calendar },
  en_route: { label: "En Route", className: "bg-status-enroute text-primary-foreground", icon: Truck },
  working: { label: "Working", className: "bg-status-working text-foreground", icon: Zap },
  on_hold: { label: "On Hold", className: "bg-amber-100 text-amber-800", icon: AlertCircle },
  complete: { label: "Complete", className: "bg-status-complete text-primary-foreground", icon: CheckCircle },
}

export function DashboardRedesigned() {
  const router = useRouter()
  const {
    jobs,
    technicians,
    smsLogs,
    notifications,
    settings,
    loadJobsFromSupabase,
    loadTechniciansFromSupabase,
  } = useStore()

  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadJobsFromSupabase(), loadTechniciansFromSupabase()])
      setIsLoading(false)
    }
    loadData()
  }, [loadJobsFromSupabase, loadTechniciansFromSupabase])

  // Stats
  const totalJobs = jobs.length
  const scheduledJobs = jobs.filter((j) => j.status === "scheduled").length
  const inProgressJobs = jobs.filter(
    (j) => j.status === "en_route" || j.status === "working"
  ).length
  const completedJobs = jobs.filter((j) => j.status === "complete").length
  const activeTechs = technicians.filter((t) => t.is_active).length

  // Today's jobs
  const todayLocal = getTodayLocal()
  const todaysJobs = useMemo(() => {
    return jobs
      .filter((job) => isSameDayLocal(job.scheduled_time, todayLocal))
      .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime())
  }, [jobs, todayLocal])

  // Jobs needing attention (on hold, unassigned, overdue)
  const attentionJobs = useMemo(() => {
    return jobs.filter(
      (j) =>
        j.status === "on_hold" ||
        (j.status === "scheduled" && !j.assigned_tech_ids?.length) ||
        (new Date(j.scheduled_time) < new Date() &&
          j.status !== "complete" &&
          j.status !== "on_hold")
    )
  }, [jobs])

  // Recent notifications
  const recentNotifications = notifications.slice(0, 5)

  // Today's SMS count
  const smsSentToday = smsLogs.filter((log) =>
    isSameDayLocal(log.sent_at, todayLocal)
  ).length

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <SkeletonStats />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SkeletonList count={3} />
          </div>
          <div>
            <SkeletonList count={2} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Command Palette */}
      <CommandPalette />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome back{settings?.company_name ? `, ${settings.company_name}` : ""}
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCreateWizardOpen(true)}
            className="touch-target"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Job
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/technicians")}
            className="hidden sm:flex touch-target"
          >
            <Users className="mr-2 h-4 w-4" />
            Add Tech
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Jobs"
          value={todaysJobs.length}
          description="Scheduled today"
          icon={Calendar}
          trend={todaysJobs.length > 0 ? "up" : "neutral"}
          onClick={() => router.push("/jobs")}
        />
        <StatCard
          title="In Progress"
          value={inProgressJobs}
          description="Active jobs"
          icon={Zap}
          color="amber"
          onClick={() => router.push("/jobs?status=en_route,working")}
        />
        <StatCard
          title="Completed"
          value={completedJobs}
          description="All time"
          icon={CheckCircle}
          color="emerald"
          onClick={() => router.push("/jobs?status=complete")}
        />
        <StatCard
          title="Active Techs"
          value={activeTechs}
          description="Available"
          icon={Users}
          onClick={() => router.push("/technicians")}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Jobs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Jobs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Today's Schedule</CardTitle>
                {todaysJobs.length > 0 && (
                  <Badge variant="secondary">{todaysJobs.length}</Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/jobs">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {todaysJobs.length === 0 ? (
                <EmptyJobs onCreate={() => setIsCreateWizardOpen(true)} />
              ) : (
                <div className="space-y-3">
                  {todaysJobs.slice(0, 5).map((job) => (
                    <JobCard key={job.id} job={job} technicians={technicians} />
                  ))}
                  {todaysJobs.length > 5 && (
                    <Button variant="ghost" className="w-full" asChild>
                      <Link href="/jobs">
                        View {todaysJobs.length - 5} more
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Needs Attention */}
          {attentionJobs.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <CardTitle className="text-lg text-amber-900">
                    Needs Attention
                  </CardTitle>
                  <Badge variant="destructive">{attentionJobs.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attentionJobs.slice(0, 3).map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      technicians={technicians}
                      variant="attention"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Activity & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full justify-start touch-target"
                onClick={() => setIsCreateWizardOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Job
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start touch-target"
                onClick={() => router.push("/technicians")}
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Technicians
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start touch-target"
                onClick={() => router.push("/settings")}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Edit SMS Templates
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start touch-target"
                onClick={() => router.push("/reports")}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </div>
              {notifications.filter((n) => !n.is_read).length > 0 && (
                <Badge variant="destructive">
                  {notifications.filter((n) => !n.is_read).length} new
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              {recentNotifications.length === 0 ? (
                <EmptyNotifications />
              ) : (
                <div className="space-y-3">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg transition-colors",
                        notification.is_read
                          ? "bg-muted/50"
                          : "bg-primary/5 border border-primary/10"
                      )}
                    >
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SMS Usage */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">SMS Sent Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{smsSentToday}</span>
                <span className="text-muted-foreground">messages</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Unlimited messaging included
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Job Creation Wizard */}
      <JobCreationWizard
        open={isCreateWizardOpen}
        onOpenChange={setIsCreateWizardOpen}
        onSuccess={() => {
          loadJobsFromSupabase()
          toast.success("Job created successfully!")
        }}
      />
    </div>
  )
}

// Sub-components
function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color = "default",
  trend = "neutral",
  onClick,
}: {
  title: string
  value: number
  description: string
  icon: React.ElementType
  color?: "default" | "amber" | "emerald" | "blue"
  trend?: "up" | "down" | "neutral"
  onClick?: () => void
}) {
  const colorClasses = {
    default: "text-foreground",
    amber: "text-amber-600",
    emerald: "text-emerald-600",
    blue: "text-blue-600",
  }

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        onClick && "hover:scale-[1.02]"
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className={cn(
            "p-2 rounded-lg",
            color === "amber" && "bg-amber-100",
            color === "emerald" && "bg-emerald-100",
            color === "blue" && "bg-blue-100",
            color === "default" && "bg-muted"
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4",
              color === "amber" && "text-amber-600",
              color === "emerald" && "text-emerald-600",
              color === "blue" && "text-blue-600",
              color === "default" && "text-foreground"
            )}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className={cn("text-2xl font-bold", colorClasses[color])}>
            {value}
          </span>
          {trend === "up" && (
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          )}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function JobCard({
  job,
  technicians,
  variant = "default",
}: {
  job: {
    id: string
    customer_name: string
    customer_address: string
    job_type: string
    status: JobStatus
    scheduled_time: string
    assigned_tech_ids: string[] | null
  }
  technicians: Array<{ id: string; name: string }>
  variant?: "default" | "attention"
}) {
  const status = statusConfig[job.status]
  const assignedTechs = job.assigned_tech_ids
    ?.map((id) => technicians.find((t) => t.id === id))
    .filter(Boolean)

  const scheduledTime = new Date(job.scheduled_time)
  const isPast = scheduledTime < new Date() && job.status !== "complete"

  return (
    <Link href={`/jobs/${job.id}`}>
      <div
        className={cn(
          "flex items-start gap-3 p-4 rounded-lg border transition-all hover:shadow-md",
          variant === "attention"
            ? "bg-amber-50 border-amber-200 hover:border-amber-300"
            : "bg-card hover:border-primary/20"
        )}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            status.className
          )}
        >
          <status.icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium truncate">{job.customer_name}</p>
              <p className="text-sm text-muted-foreground">{job.job_type}</p>
            </div>
            <Badge variant="secondary" className={cn("shrink-0", status.className)}>
              {status.label}
            </Badge>
          </div>

          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {scheduledTime.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
              {isPast && <span className="text-destructive ml-1">(Overdue)</span>}
            </span>

            {assignedTechs && assignedTechs.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {assignedTechs.map((t) => t?.name).join(", ")}
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground mt-1 truncate">
            <MapPin className="h-3.5 w-3.5 inline mr-1" />
            {job.customer_address}
          </p>
        </div>
      </div>
    </Link>
  )
}
