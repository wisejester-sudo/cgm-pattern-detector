"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Clock, Truck, CheckCircle, Users, MessageSquare, Plus, BarChart3, MapPin } from "lucide-react"
import Link from "next/link"
import { Button, BrandButton } from "@/components/ui/button"
import { useStore, getTechnicianById } from "@/lib/store"
import { CreateJobModal } from "@/components/create-job-modal"
import type { JobStatus } from "@/lib/types"

const statusConfig: Record<JobStatus, { label: string; className: string }> = {
  scheduled: { label: "Scheduled", className: "bg-status-scheduled text-foreground" },
  en_route: { label: "En Route", className: "bg-status-enroute text-primary-foreground" },
  working: { label: "Working", className: "bg-status-working text-foreground" },
  complete: { label: "Complete", className: "bg-status-complete text-primary-foreground" },
}

export default function DashboardPage() {
  const { jobs, technicians, smsLogs, currentAdmin, subscription, loadJobsFromSupabase, loadTechniciansFromSupabase } = useStore()
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Load data from Supabase on mount
  useEffect(() => {
    loadJobsFromSupabase()
    loadTechniciansFromSupabase()
  }, [loadJobsFromSupabase, loadTechniciansFromSupabase])

  // Prevent hydration mismatch by only rendering dynamic content after mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const totalJobs = jobs.length
  const scheduledJobs = jobs.filter((j) => j.status === "scheduled").length
  const inProgressJobs = jobs.filter(
    (j) => j.status === "en_route" || j.status === "working"
  ).length
  const completedJobs = jobs.filter((j) => j.status === "complete").length
  const activeTechs = technicians.filter((t) => t.is_active).length

  // Today's jobs
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todaysJobs = jobs.filter((job) => {
    const jobDate = new Date(job.scheduled_time)
    jobDate.setHours(0, 0, 0, 0)
    return jobDate.getTime() === today.getTime()
  })

  // SMS sent today
  const smsSentToday = smsLogs.filter((log) => {
    const logDate = new Date(log.sent_at)
    logDate.setHours(0, 0, 0, 0)
    return logDate.getTime() === today.getTime()
  }).length

  // Show loading state during hydration to prevent mismatch
  if (!isMounted) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: "Total Jobs",
      value: totalJobs.toString(),
      description: "All time",
      icon: Briefcase,
      color: "text-foreground",
      bgColor: "bg-muted",
    },
    {
      title: "Scheduled",
      value: scheduledJobs.toString(),
      description: "Pending dispatch",
      icon: Clock,
      color: "text-status-scheduled",
      bgColor: "bg-status-scheduled/10",
    },
    {
      title: "In Progress",
      value: inProgressJobs.toString(),
      description: "En route or working",
      icon: Truck,
      color: "text-status-enroute",
      bgColor: "bg-status-enroute/10",
    },
    {
      title: "Completed",
      value: completedJobs.toString(),
      description: "Finished jobs",
      icon: CheckCircle,
      color: "text-status-complete",
      bgColor: "bg-status-complete/10",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome back, {currentAdmin?.name.split(" ")[0] || "Admin"}
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your business today
          </p>
        </div>
        <BrandButton onClick={() => setIsCreateJobOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Job
        </BrandButton>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Today&apos;s Jobs</CardTitle>
            <Badge variant="secondary">{todaysJobs.length} jobs</Badge>
          </CardHeader>
          <CardContent>
            {todaysJobs.length > 0 ? (
              <div className="space-y-3">
                {todaysJobs.slice(0, 5).map((job) => {
                  const tech = getTechnicianById(technicians, job.assigned_tech_ids?.[0] ?? null)
                  const scheduledTime = new Date(job.scheduled_time)
                  return (
                    <Link key={job.id} href={`/jobs/${job.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{job.customer_name}</p>
                            <Badge className={statusConfig[job.status].className}>
                              {statusConfig[job.status].label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{job.job_type}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-medium">
                            {scheduledTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <p className="text-muted-foreground">{tech?.name || "Unassigned"}</p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
                {todaysJobs.length > 5 && (
                  <Link href="/jobs" className="block text-center text-sm text-primary hover:underline py-2">
                    View all {todaysJobs.length} jobs
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No jobs scheduled for today</p>
                <Button variant="link" onClick={() => setIsCreateJobOpen(true)}>
                  Create a new job
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Technicians Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Active Technicians</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-bold">{activeTechs}</span>
              <span className="text-muted-foreground">technicians available</span>
            </div>
            <div className="space-y-3">
              {technicians
                .filter((t) => t.is_active)
                .map((tech) => {
                  const techJobs = jobs.filter((j) => j.assigned_tech_ids?.includes(tech.id) && j.status !== "complete")
                  const currentJob = jobs.find((j) => j.assigned_tech_ids?.includes(tech.id) && (j.status === "en_route" || j.status === "working"))
                  return (
                    <div key={tech.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {tech.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{tech.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {currentJob ? currentJob.job_type : "Available"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {currentJob && (
                          <Badge className={statusConfig[currentJob.status].className}>
                            {statusConfig[currentJob.status].label}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {techJobs.length} jobs
                        </span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Stats Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">SMS Sent Today</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{smsSentToday}</div>
            <p className="text-xs text-muted-foreground">
              {subscription.sms_used_this_month}/{subscription.sms_limit} this month
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <BrandButton onClick={() => setIsCreateJobOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Job
            </BrandButton>
            <Link href="/technicians">
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Add Technician
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <CreateJobModal open={isCreateJobOpen} onOpenChange={setIsCreateJobOpen} />
    </div>
  )
}
