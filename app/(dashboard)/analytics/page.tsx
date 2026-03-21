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
  AreaChart,
  Area,
} from "recharts"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle,
  Clock,
  Calendar,
  Wrench,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
} from "lucide-react"
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"

const COLORS = {
  primary: "#2563eb",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
  gray: "#6b7280",
}

const JOB_TYPE_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export default function AnalyticsPage() {
  const { jobs, technicians, settings } = useStore()
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "ytd">("30d")
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
        : new Date(end.getFullYear(), 0, 1)
    return { start, end }
  }, [timeRange])

  // Filter jobs by date range
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const jobDate = new Date(job.created_at)
      return jobDate >= dateRange.start && jobDate <= dateRange.end
    })
  }, [jobs, dateRange])

  // ===== FINANCIAL METRICS =====
  
  // Total revenue (mock calculation based on job types)
  const revenueMetrics = useMemo(() => {
    const jobTypeValues: Record<string, number> = {
      "Service Call": 150,
      "Repair": 350,
      "Installation": 2500,
      "Maintenance": 120,
      "Inspection": 89,
      "Emergency": 450,
    }

    const totalRevenue = filteredJobs.reduce((sum, job) => {
      return sum + (jobTypeValues[job.job_type] || 200)
    }, 0)

    const completedRevenue = filteredJobs
      .filter((j) => j.status === "complete")
      .reduce((sum, job) => sum + (jobTypeValues[job.job_type] || 200), 0)

    const avgJobValue = filteredJobs.length > 0 ? totalRevenue / filteredJobs.length : 0

    return {
      totalRevenue,
      completedRevenue,
      avgJobValue,
      outstandingRevenue: totalRevenue - completedRevenue,
    }
  }, [filteredJobs])

  // Revenue by job type
  const revenueByJobType = useMemo(() => {
    const jobTypeValues: Record<string, number> = {
      "Service Call": 150,
      "Repair": 350,
      "Installation": 2500,
      "Maintenance": 120,
      "Inspection": 89,
      "Emergency": 450,
    }

    const data: Record<string, { revenue: number; count: number }> = {}
    
    filteredJobs.forEach((job) => {
      if (!data[job.job_type]) {
        data[job.job_type] = { revenue: 0, count: 0 }
      }
      data[job.job_type].revenue += jobTypeValues[job.job_type] || 200
      data[job.job_type].count += 1
    })

    return Object.entries(data)
      .map(([name, { revenue, count }]) => ({
        name,
        revenue,
        count,
        avgValue: Math.round(revenue / count),
      }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [filteredJobs])

  // ===== OPERATIONAL METRICS =====

  // Job completion stats
  const completionStats = useMemo(() => {
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

  // Technician performance
  const techPerformance = useMemo(() => {
    return technicians
      .filter((t) => t.is_active)
      .map((tech) => {
        const techJobs = filteredJobs.filter((j) =>
          j.assigned_tech_ids?.includes(tech.id)
        )
        const completed = techJobs.filter((j) => j.status === "complete")
        const totalRevenue = completed.reduce((sum, job) => {
          const jobValue =
            {
              "Service Call": 150,
              Repair: 350,
              Installation: 2500,
              Maintenance: 120,
              Inspection: 89,
              Emergency: 450,
            }[job.job_type] || 200
          return sum + jobValue
        }, 0)

        return {
          name: tech.name,
          totalJobs: techJobs.length,
          completedJobs: completed.length,
          completionRate:
            techJobs.length > 0
              ? Math.round((completed.length / techJobs.length) * 100)
              : 0,
          revenue: totalRevenue,
          avgJobValue: completed.length > 0 ? Math.round(totalRevenue / completed.length) : 0,
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
  }, [filteredJobs, technicians])

  // Daily job trend
  const dailyTrend = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end })
    
    return days.map((day) => {
      const dayStr = format(day, "MMM dd")
      const dayJobs = filteredJobs.filter(
        (j) => format(new Date(j.created_at), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
      )
      
      return {
        date: dayStr,
        total: dayJobs.length,
        completed: dayJobs.filter((j) => j.status === "complete").length,
        revenue: dayJobs.reduce((sum, job) => {
          const values: Record<string, number> = {
            "Service Call": 150,
            Repair: 350,
            Installation: 2500,
            Maintenance: 120,
            Inspection: 89,
            Emergency: 450,
          }
          return sum + (values[job.job_type] || 200)
        }, 0),
      }
    })
  }, [filteredJobs, dateRange])

  // Customer metrics
  const customerMetrics = useMemo(() => {
    const uniqueCustomers = new Set(filteredJobs.map((j) => j.customer_phone)).size
    const repeatCustomers = filteredJobs.filter((job, index, self) => {
      return self.findIndex((j) => j.customer_phone === job.customer_phone) !== index
    }).length

    return {
      uniqueCustomers,
      repeatCustomers,
      repeatRate:
        uniqueCustomers > 0
          ? Math.round((repeatCustomers / uniqueCustomers) * 100)
          : 0,
    }
  }, [filteredJobs])

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Business Analytics</h1>
          <p className="text-muted-foreground">
            Track revenue, performance, and growth metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="ytd">Year to date</SelectItem>
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
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="technicians">Technicians</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Total Revenue"
              value={`$${revenueMetrics.totalRevenue.toLocaleString()}`}
              subtitle={`${completionStats.completed} jobs completed`}
              icon={DollarSign}
              trend="up"
              color="green"
            />
            <KpiCard
              title="Avg Job Value"
              value={`$${Math.round(revenueMetrics.avgJobValue)}`}
              subtitle="Per completed job"
              icon={Target}
              trend="neutral"
            />
            <KpiCard
              title="Completion Rate"
              value={`${completionStats.completionRate}%`}
              subtitle={`${completionStats.completed} of ${completionStats.total} jobs`}
              icon={CheckCircle}
              trend={completionStats.completionRate > 80 ? "up" : "down"}
              color={completionStats.completionRate > 80 ? "green" : "amber"}
            />
            <KpiCard
              title="Active Customers"
              value={customerMetrics.uniqueCustomers.toString()}
              subtitle={`${customerMetrics.repeatRate}% repeat customers`}
              icon={Users}
              trend="up"
            />
          </div>

          {/* Daily Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Performance</CardTitle>
              <CardDescription>Revenue and jobs by day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyTrend}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke={COLORS.primary}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue ($)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="total"
                    stroke={COLORS.success}
                    strokeWidth={2}
                    name="Jobs"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Job Type Breakdown */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Job Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={revenueByJobType}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="revenue"
                    >
                      {revenueByJobType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={JOB_TYPE_COLORS[index % JOB_TYPE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {revenueByJobType.slice(0, 5).map((type, index) => (
                    <div key={type.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: JOB_TYPE_COLORS[index % JOB_TYPE_COLORS.length] }}
                        />
                        <span>{type.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">{type.count} jobs</span>
                        <span className="font-medium">${type.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Technicians</CardTitle>
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
                            {tech.completedJobs} jobs completed
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${tech.revenue.toLocaleString()}</p>
                        <Badge
                          variant={tech.completionRate > 90 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {tech.completionRate}% completion
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* REVENUE TAB */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <KpiCard
              title="Total Revenue"
              value={`$${revenueMetrics.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              color="green"
            />
            <KpiCard
              title="Outstanding"
              value={`$${revenueMetrics.outstandingRevenue.toLocaleString()}`}
              icon={Clock}
              color="amber"
            />
            <KpiCard
              title="Avg Job Value"
              value={`$${Math.round(revenueMetrics.avgJobValue)}`}
              icon={Target}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue by Job Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={revenueByJobType} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Bar dataKey="revenue" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TECHNICIANS TAB */}
        <TabsContent value="technicians" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Technician Performance Leaderboard</CardTitle>
              <CardDescription>Ranked by revenue generated</CardDescription>
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
                          <span>{tech.totalJobs} total jobs</span>
                          <span>{tech.completedJobs} completed</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${tech.revenue.toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={tech.completionRate > 90 ? "default" : "secondary"}>
                          {tech.completionRate}% completion
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          ${tech.avgJobValue} avg
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CUSTOMERS TAB */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <KpiCard
              title="Unique Customers"
              value={customerMetrics.uniqueCustomers.toString()}
              icon={Users}
            />
            <KpiCard
              title="Repeat Customer Rate"
              value={`${customerMetrics.repeatRate}%`}
              icon={TrendingUp}
              trend={customerMetrics.repeatRate > 30 ? "up" : "neutral"}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-3xl font-bold">{customerMetrics.uniqueCustomers}</p>
                  <p className="text-sm text-muted-foreground">Unique Customers</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-3xl font-bold">{customerMetrics.repeatCustomers}</p>
                  <p className="text-sm text-muted-foreground">Repeat Customers</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-3xl font-bold">
                    {filteredJobs.length > 0
                      ? Math.round(filteredJobs.length / customerMetrics.uniqueCustomers)
                      : 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Jobs per Customer</p>
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

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-3xl font-bold mt-2 ${colorClasses[color]}`}>{value}</p>
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
