"use client"

import { useState, useMemo } from "react"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import {
  Download,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  Calendar,
} from "lucide-react"
import { WorkspaceBackground } from "@/components/workspace-background"
import { useStore, getTechnicianById } from "@/lib/store"
import type { JobStatus } from "@/lib/types"

type TimeRange = "7d" | "30d" | "90d"

const statusConfig: Record<JobStatus, { label: string; className: string }> = {
  available: { label: "Available", className: "bg-blue-100 text-blue-800" },
  scheduled: { label: "Scheduled", className: "bg-status-scheduled text-foreground" },
  en_route: { label: "En Route", className: "bg-status-enroute text-primary-foreground" },
  working: { label: "Working", className: "bg-status-working text-foreground" },
  on_hold: { label: "On Hold", className: "bg-amber-100 text-amber-800" },
  complete: { label: "Complete", className: "bg-status-complete text-primary-foreground" },
}

export default function ReportsPage() {
  const { jobs, technicians, smsLogs, subscription } = useStore()
  const [timeRange, setTimeRange] = useState<TimeRange>("30d")

  // Calculate date range
  const dateRange = useMemo(() => {
    const now = new Date()
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return { start, end: now }
  }, [timeRange])

  // Filter jobs by date range
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const jobDate = new Date(job.created_at)
      return jobDate >= dateRange.start && jobDate <= dateRange.end
    })
  }, [jobs, dateRange])

  // Calculate stats
  const stats = useMemo(() => {
    const totalJobs = filteredJobs.length
    const completedJobs = filteredJobs.filter((j) => j.status === "complete").length
    const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0
    
    // Simulated previous period for comparison
    const prevPeriodJobs = Math.floor(totalJobs * 0.85)
    const jobsChange = totalJobs > 0 ? ((totalJobs - prevPeriodJobs) / prevPeriodJobs) * 100 : 0

    const smsSent = smsLogs.filter((log) => {
      const logDate = new Date(log.sent_at)
      return logDate >= dateRange.start && logDate <= dateRange.end
    }).length

    const smsDelivered = smsLogs.filter((log) => {
      const logDate = new Date(log.sent_at)
      return logDate >= dateRange.start && logDate <= dateRange.end && log.status === "sent"
    }).length

    const deliveryRate = smsSent > 0 ? (smsDelivered / smsSent) * 100 : 0

    return {
      totalJobs,
      completedJobs,
      completionRate,
      jobsChange,
      smsSent,
      deliveryRate,
      activeTechs: technicians.filter((t) => t.is_active).length,
    }
  }, [filteredJobs, smsLogs, dateRange, technicians])

  // Technician performance
  const techPerformance = useMemo(() => {
    return technicians
      .filter((tech) => tech.is_active)
      .map((tech) => {
        const techJobs = filteredJobs.filter((j) => j.assigned_tech_ids?.includes(tech.id))
        const completedJobs = techJobs.filter((j) => j.status === "complete").length
        const avgTime = techJobs.length > 0 ? Math.floor(Math.random() * 60) + 30 : 0 // Simulated
        
        return {
          ...tech,
          totalJobs: techJobs.length,
          completedJobs,
          completionRate: techJobs.length > 0 ? (completedJobs / techJobs.length) * 100 : 0,
          avgTime,
        }
      })
      .sort((a, b) => b.completedJobs - a.completedJobs)
  }, [technicians, filteredJobs])

  // Jobs by type
  const jobsByType = useMemo(() => {
    const types: Record<string, number> = {}
    filteredJobs.forEach((job) => {
      types[job.job_type] = (types[job.job_type] || 0) + 1
    })
    return Object.entries(types)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
  }, [filteredJobs])

  // Recent jobs
  const recentJobs = useMemo(() => {
    return [...jobs]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 10)
  }, [jobs])

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ["Job ID", "Customer", "Type", "Status", "Technician", "Scheduled", "Created"]
    const rows = filteredJobs.map((job) => {
      const tech = getTechnicianById(technicians, job.assigned_tech_ids?.[0] ?? null)
      return [
        job.id,
        job.customer_name,
        job.job_type,
        job.status,
        tech?.name || "Unassigned",
        new Date(job.scheduled_time).toLocaleString(),
        new Date(job.created_at).toLocaleString(),
      ]
    })

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dispatchly-report-${timeRange}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Report exported successfully')
  }

  return (
    <div className="relative">
      <WorkspaceBackground />
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
          <p className="text-muted-foreground">
            Analytics and insights for your business
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Jobs
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <div className="flex items-center gap-1 text-xs">
              {stats.jobsChange >= 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">+{stats.jobsChange.toFixed(0)}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">{stats.jobsChange.toFixed(0)}%</span>
                </>
              )}
              <span className="text-muted-foreground">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate.toFixed(0)}%</div>
            <Progress value={stats.completionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              SMS Sent
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.smsSent}</div>
            <p className="text-xs text-muted-foreground">
              {stats.deliveryRate.toFixed(0)}% delivery rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Technicians
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTechs}</div>
            <p className="text-xs text-muted-foreground">
              {technicians.length} total registered
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Technician Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Technician Performance</CardTitle>
            <CardDescription>Jobs completed by each technician</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {techPerformance.map((tech) => (
                <div key={tech.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                        {tech.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{tech.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {tech.completedJobs} completed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{tech.totalJobs} jobs</p>
                      <p className="text-xs text-muted-foreground">
                        avg {tech.avgTime}min
                      </p>
                    </div>
                  </div>
                  <Progress value={tech.completionRate} className="h-2" />
                </div>
              ))}
              {techPerformance.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No technician data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Jobs by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Jobs by Service Type</CardTitle>
            <CardDescription>Distribution of job types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobsByType.map((item) => {
                const percentage = (item.count / stats.totalJobs) * 100
                return (
                  <div key={item.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.type}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
              {jobsByType.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No job data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
          <CardDescription>Latest job activity across your team</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentJobs.map((job) => {
                const tech = getTechnicianById(technicians, job.assigned_tech_ids?.[0] ?? null)
                return (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.customer_name}</TableCell>
                    <TableCell>{job.job_type}</TableCell>
                    <TableCell>{tech?.name || "Unassigned"}</TableCell>
                    <TableCell>
                      <Badge className={statusConfig[job.status].className}>
                        {statusConfig[job.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(job.scheduled_time).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                )
              })}
              {recentJobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No jobs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}
