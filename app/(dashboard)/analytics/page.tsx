"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStore } from "@/lib/store"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import {
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  Calendar,
  Wrench,
  TrendingUp,
  TrendingDown,
  Download,
  MessageSquare,
  Timer,
  Target,
} from "lucide-react"
import { format, subDays, eachDayOfInterval, differenceInHours, parseISO } from "date-fns"

const COLORS = {
  scheduled: "#3b82f6",
  working: "#f59e0b",
  complete: "#10b981",
  enroute: "#8b5cf6",
  onhold: "#ef4444",
  available: "#6b7280",
}

const STATUS_COLORS = [
  "#3b82f6", // scheduled - blue
  "#8b5cf6", // en_route - purple
  "#f59e0b", // working - amber
  "#10b981", // complete - green
  "#ef4444", // on_hold - red
  "#6b7280", // available - gray
]

export default function AnalyticsPage() {
  const { jobs, technicians, smsLogs } = useStore()
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d")
  const [activeTab, setActiveTab] = useState("overview")

  // Calculate date range
  const dateRange = useMemo(() => {
    const end = new Date()
    const start =
      timeRange === "7d"
        ? subDays(end, 7)
        : timeRange === "30d"
        ? subDays(end, 30)
        : timeRange === "90d"
        ? subDays(end, 90)
        : new Date(0) // All time
    return { start, end }
  }, [timeRange])

  // Filter jobs by date range
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const jobDate = new Date(job.created_at)
      return jobDate >= dateRange.start && jobDate <= dateRange.end
    })
  }, [jobs, dateRange])

  // ===== OPERATIONAL METRICS =====

  // Job status breakdown
  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredJobs.forEach((job) => {
      counts[job.status] = (counts[job.status] || 0) + 1
    })
    return Object.entries(counts).map(([status, count]) => ({
      name: status.replace("_", " "),
      count,
      percentage: Math.round((count / filteredJobs.length) * 100),
    }))
  }, [filteredJobs])

  // Completion metrics
  const completionMetrics = useMemo(() => {
    const total = filteredJobs.length
    const completed = filteredJobs.filter((j) => j.status === "complete").length
    const inProgress = filteredJobs.filter(
      (j) => j.status === "working" || j.status === "en_route"
    ).length
    const scheduled = filteredJobs.filter((j) => j.status === "scheduled").length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      total,
      completed,
      inProgress,
      scheduled,
      completionRate,
    }
  }, [filteredJobs])

  // Average time to complete (for completed jobs)
  const avgCompletionTime = useMemo(() => {
    const completedJobs = filteredJobs.filter((j) => j.status === "complete")
    
    if (completedJobs.length === 0) return null

    const totalHours = completedJobs.reduce((sum, job) => {
      const created = parseISO(job.created_at)
      const scheduled = parseISO(job.scheduled_time)
      // Use scheduled time as proxy for completion (or updated_at if available)
      const hours = differenceInHours(scheduled, created)
      return sum + Math.abs(hours)
    }, 0)

    const avg = totalHours / completedJobs.length
    return {
      hours: Math.round(avg),
      days: Math.round(avg / 24 * 10) / 10,
    }
  }, [filteredJobs])

  // Jobs by type
  const jobsByType = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredJobs.forEach((job) => {
      counts[job.job_type] = (counts[job.job_type] || 0) + 1
    })
    return Object.entries(counts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
  }, [filteredJobs])

  // Technician performance (job counts only)
  const techPerformance = useMemo(() => {
    return technicians
      .filter((t) => t.is_active)
      .map((tech) => {
        const techJobs = filteredJobs.filter((j) =>
          j.assigned_tech_ids?.includes(tech.id)
        )
        const completed = techJobs.filter((j) => j.status === "complete").length
        const inProgress = techJobs.filter(
          (j) => j.status === "working" || j.status === "en_route"
        ).length

        return {
          name: tech.name,
          totalJobs: techJobs.length,
          completed,
          inProgress,
          completionRate:
            techJobs.length > 0
              ? Math.round((completed / techJobs.length) * 100)
              : 0,
        }
      })
      .sort((a, b) => b.totalJobs - a.totalJobs)
  }, [filteredJobs, technicians])

  // Daily job trend
  const dailyTrend = useMemo(() => {
    if (timeRange === "all") {
      // Group by month for all time view
      const months: Record<string, { jobs: number; completed: number }> = {}
      
      filteredJobs.forEach((job) => {
        const month = format(parseISO(job.created_at), "MMM yyyy")
        if (!months[month]) {
          months[month] = { jobs: 0, completed: 0 }
        }
        months[month].jobs += 1
        if (job.status === "complete") {
          months[month].completed += 1
        }
      })

      return Object.entries(months).map(([date, data]) => ({
        date,
        ...data,
      }))
    }

    // Daily view for shorter ranges
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end })
    
    return days.map((day) => {
      const dayStr = format(day, "MMM dd")
      const dayJobs = filteredJobs.filter(
        (j) => format(parseISO(j.created_at), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
      )
      
      return {
        date: dayStr,
        jobs: dayJobs.length,
        completed: dayJobs.filter((j) => j.status === "complete").length,
      }
    })
  }, [filteredJobs, dateRange, timeRange])

  // Customer metrics
  const customerMetrics = useMemo(() => {
    const uniqueCustomers = new Set(filteredJobs.map((j) => j.customer_phone)).size
    
    // Find repeat customers (customers with multiple jobs)
    const customerJobs: Record<string, number> = {}
    filteredJobs.forEach((job) => {
      customerJobs[job.customer_phone] = (customerJobs[job.customer_phone] || 0) + 1
    })
    const repeatCustomers = Object.values(customerJobs).filter((count) => count > 1).length

    return {
      uniqueCustomers,
      repeatCustomers,
      repeatRate: uniqueCustomers > 0 ? Math.round((repeatCustomers / uniqueCustomers) * 100) : 0,
      avgJobsPerCustomer: uniqueCustomers > 0 
        ? Math.round((filteredJobs.length / uniqueCustomers) * 10) / 10 
        : 0,
    }
  }, [filteredJobs])

  // Communication metrics
  const communicationMetrics = useMemo(() => {
    const filteredSms = smsLogs.filter((sms) => {
      const smsDate = new Date(sms.sent_at)
      return smsDate >= dateRange.start && smsDate <= dateRange.end
    })

    return {
      totalMessages: filteredSms.length,
      inbound: filteredSms.filter((s) => s.direction === "inbound").length,
      outbound: filteredSms.filter((s) => s.direction === "outbound").length,
    }
  }, [smsLogs, dateRange])

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Business Analytics</h1>
          <p className="text-muted-foreground">
            Track job performance, technician productivity, and customer metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="technicians">Technicians</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Total Jobs"
              value={completionMetrics.total.toString()}
              subtitle={`${completionMetrics.completed} completed`}
              icon={Briefcase}
              trend={completionMetrics.total > 10 ? "up" : "neutral"}
            />
            <KpiCard
              title="Completion Rate"
              value={`${completionMetrics.completionRate}%`}
              subtitle={`${completionMetrics.completed} of ${completionMetrics.total} jobs`}
              icon={CheckCircle}
              trend={completionMetrics.completionRate > 75 ? "up" : "down"}
              color={completionMetrics.completionRate > 75 ? "green" : "amber"}
            />
            <KpiCard
              title="Active Technicians"
              value={technicians.filter((t) => t.is_active).length.toString()}
              subtitle="Available for work"
              icon={Wrench}
            />
            <KpiCard
              title="Unique Customers"
              value={customerMetrics.uniqueCustomers.toString()}
              subtitle={`${customerMetrics.repeatRate}% repeat rate`}
              icon={Users}
              trend={customerMetrics.repeatRate > 30 ? "up" : "neutral"}
            />
          </div>

          {/* Job Status Distribution */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Job Status Breakdown</CardTitle>
                <CardDescription>Current status of all jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {statusBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {statusBreakdown.map((status, index) => (
                    <div key={status.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: STATUS_COLORS[index % STATUS_COLORS.length] }}
                        />
                        <span className="capitalize">{status.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">{status.count}</Badge>
                        <span className="text-muted-foreground w-12 text-right">{status.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Technicians</CardTitle>
                <CardDescription>By jobs completed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {techPerformance.slice(0, 5).map((tech, index) => (
                    <div key={tech.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{tech.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {tech.totalJobs} jobs assigned
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={tech.completionRate > 90 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {tech.completed} completed
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Job Volume Trend</CardTitle>
              <CardDescription>Jobs created over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="jobs"
                    stroke={COLORS.scheduled}
                    strokeWidth={2}
                    name="Total Jobs"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke={COLORS.complete}
                    strokeWidth={2}
                    name="Completed"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* JOBS TAB */}
        <TabsContent value="jobs" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <KpiCard
              title="Total Jobs"
              value={completionMetrics.total.toString()}
              icon={Briefcase}
            />
            <KpiCard
              title="Completed"
              value={completionMetrics.completed.toString()}
              icon={CheckCircle}
              color="green"
            />
            <KpiCard
              title="In Progress"
              value={completionMetrics.inProgress.toString()}
              icon={Clock}
              color="amber"
            />
          </div>

          {avgCompletionTime && (
            <Card>
              <CardHeader>
                <CardTitle>Average Completion Time</CardTitle>
                <CardDescription>Time from creation to scheduled completion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-4xl font-bold">{avgCompletionTime.hours}</p>
                    <p className="text-muted-foreground">hours</p>
                  </div>
                  <div className="text-2xl text-muted-foreground">or</div>
                  <div className="text-center">
                    <p className="text-4xl font-bold">{avgCompletionTime.days}</p>
                    <p className="text-muted-foreground">days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Jobs by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={jobsByType} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="type" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS.scheduled} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TECHNICIANS TAB */}
        <TabsContent value="technicians" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Technician Performance</CardTitle>
              <CardDescription>Jobs assigned and completed by technician</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {techPerformance.map((tech, index) => (
                  <div
                    key={tech.name}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                          index === 0
                            ? "bg-yellow-100 text-yellow-700"
                            : index === 1
                            ? "bg-gray-100 text-gray-700"
                            : index === 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-muted"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{tech.name}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{tech.totalJobs} assigned</span>
                          <span>{tech.completed} completed</span>
                          <span>{tech.inProgress} in progress</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={tech.completionRate > 90 ? "default" : "secondary"}
                        className="text-sm"
                      >
                        {tech.completionRate}% completion
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CUSTOMERS TAB */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Unique Customers"
              value={customerMetrics.uniqueCustomers.toString()}
              icon={Users}
            />
            <KpiCard
              title="Repeat Customers"
              value={customerMetrics.repeatCustomers.toString()}
              icon={Target}
            />
            <KpiCard
              title="Repeat Rate"
              value={`${customerMetrics.repeatRate}%`}
              icon={TrendingUp}
              trend={customerMetrics.repeatRate > 30 ? "up" : "neutral"}
            />
            <KpiCard
              title="Avg Jobs/Customer"
              value={customerMetrics.avgJobsPerCustomer.toString()}
              icon={Briefcase}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Communication Activity</CardTitle>
              <CardDescription>SMS messages sent and received</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-3xl font-bold">{communicationMetrics.totalMessages}</p>
                  <p className="text-sm text-muted-foreground">Total Messages</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 text-center">
                  <p className="text-3xl font-bold text-blue-600">{communicationMetrics.outbound}</p>
                  <p className="text-sm text-muted-foreground">Sent</p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 text-center">
                  <p className="text-3xl font-bold text-green-600">{communicationMetrics.inbound}</p>
                  <p className="text-sm text-muted-foreground">Received</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// KPI Card Component
function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = "neutral",
  color = "blue",
}: {
  title: string
  value: string
  subtitle?: string
  icon: React.ElementType
  trend?: "up" | "down" | "neutral"
  color?: "green" | "amber" | "blue" | "red"
}) {
  const colorClasses = {
    green: "text-emerald-600",
    amber: "text-amber-600",
    blue: "text-blue-600",
    red: "text-red-600",
  }

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-2 mt-2">
              <p className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</p>
              {TrendIcon && <TrendIcon className={`h-5 w-5 ${colorClasses[color]}`} />}
            </div>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
