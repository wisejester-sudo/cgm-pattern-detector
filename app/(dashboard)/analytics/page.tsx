"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"
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
  Clock,
  TrendingUp,
  Users,
  CheckCircle,
  DollarSign,
} from "lucide-react"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function AnalyticsPage() {
  const { jobs, technicians } = useStore()

  // Job status distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {}
    jobs.forEach((job) => {
      counts[job.status] = (counts[job.status] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [jobs])

  // Jobs per technician
  const techPerformance = useMemo(() => {
    return technicians
      .filter((t) => t.is_active)
      .map((tech) => {
        const techJobs = jobs.filter((j) =>
          j.assigned_tech_ids?.includes(tech.id)
        )
        const completed = techJobs.filter((j) => j.status === "complete").length
        const inProgress = techJobs.filter(
          (j) => j.status === "working" || j.status === "en_route"
        ).length

        return {
          name: tech.name.split(" ")[0],
          total: techJobs.length,
          completed,
          inProgress,
        }
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
  }, [jobs, technicians])

  // Weekly job trend (last 7 days)
  const weeklyTrend = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const data = days.map((day) => ({ day, jobs: 0, completed: 0 }))

    jobs.forEach((job) => {
      const date = new Date(job.created_at)
      const dayIndex = date.getDay()
      data[dayIndex].jobs += 1

      if (job.status === "complete") {
        data[dayIndex].completed += 1
      }
    })

    return data
  }, [jobs])

  // Completion rate
  const completionRate = useMemo(() => {
    if (jobs.length === 0) return 0
    const completed = jobs.filter((j) => j.status === "complete").length
    return Math.round((completed / jobs.length) * 100)
  }, [jobs])

  // Average completion time (mock calculation)
  const avgCompletionTime = "2.4 days"

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Track performance metrics and business insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Jobs"
          value={jobs.length}
          icon={Briefcase}
          trend="+12%"
        />
        <MetricCard
          title="Completion Rate"
          value={`${completionRate}%`}
          icon={CheckCircle}
          trend={completionRate > 80 ? "Good" : "Needs Work"}
        />
        <MetricCard
          title="Active Techs"
          value={technicians.filter((t) => t.is_active).length}
          icon={Users}
        />
        <MetricCard
          title="Avg Completion"
          value={avgCompletionTime}
          icon={Clock}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Job Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Job Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Technician Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Technician Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={techPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#00C49F" name="Completed" />
                <Bar dataKey="inProgress" fill="#FFBB28" name="In Progress" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Job Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="jobs"
                  stroke="#8884D8"
                  name="Total Jobs"
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#00C49F"
                  name="Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  trend?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p
            className={`text-xs ${
              trend.startsWith("+") || trend === "Good"
                ? "text-green-600"
                : "text-amber-600"
            }`}
          >
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
