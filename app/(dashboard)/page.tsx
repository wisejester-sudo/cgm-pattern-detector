"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Clock, Truck, CheckCircle, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

export default function DashboardPage() {
  const { jobs, technicians } = useStore()

  const totalJobs = jobs.length
  const scheduledJobs = jobs.filter((j) => j.status === "scheduled").length
  const inProgressJobs = jobs.filter(
    (j) => j.status === "en_route" || j.status === "working"
  ).length
  const completedJobs = jobs.filter((j) => j.status === "complete").length
  const activeTechs = technicians.filter((t) => t.is_active).length

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
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your service operations
          </p>
        </div>
        <Link href="/jobs">
          <Button>View All Jobs</Button>
        </Link>
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

      {/* Active Technicians Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Technicians</CardTitle>
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{activeTechs}</span>
            <span className="text-muted-foreground">active technicians</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {technicians
              .filter((t) => t.is_active)
              .map((tech) => (
                <div
                  key={tech.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-status-complete" />
                  {tech.name}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/jobs">
            <Button variant="outline">
              <Briefcase className="mr-2 h-4 w-4" />
              Manage Jobs
            </Button>
          </Link>
          <Link href="/technicians">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Manage Technicians
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Configure SMS Templates
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
