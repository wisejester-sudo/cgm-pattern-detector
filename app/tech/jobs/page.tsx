"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, MapPin, Clock, ChevronRight, Calendar } from "lucide-react"
import Link from "next/link"
import { useStore, getTechnicianById, maskPhoneNumber } from "@/lib/store"
import type { JobStatus } from "@/lib/types"
import { useEffect, useMemo } from "react"

const statusConfig: Record<JobStatus, { label: string; className: string }> = {
  available: {
    label: "Available",
    className: "bg-blue-100 text-blue-800",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-status-scheduled text-foreground",
  },
  en_route: {
    label: "En Route",
    className: "bg-status-enroute text-primary-foreground",
  },
  working: {
    label: "Working",
    className: "bg-status-working text-foreground",
  },
  on_hold: {
    label: "On Hold",
    className: "bg-amber-100 text-amber-800",
  },
  complete: {
    label: "Complete",
    className: "bg-status-complete text-primary-foreground",
  },
}

export default function TechJobsPage() {
  const router = useRouter()
  const { jobs, technicians, currentTechId, logoutTechnician } = useStore()

  const technician = getTechnicianById(technicians, currentTechId)

  useEffect(() => {
    if (!currentTechId) {
      router.push("/tech")
    }
  }, [currentTechId, router])

  // Only show jobs assigned to this technician - DATA ISOLATION
  const myJobs = useMemo(() => {
    if (!currentTechId) return []
    return jobs
      .filter((j) => j.assigned_tech_ids?.includes(currentTechId))
      .sort((a, b) => {
        const statusOrder: Record<JobStatus, number> = {
          working: 0,
          en_route: 1,
          scheduled: 2,
          available: 3,
          on_hold: 4,
          complete: 5,
        }
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status]
        }
        return new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
      })
  }, [jobs, currentTechId])

  // Today's jobs
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todaysJobs = myJobs.filter((job) => {
    const jobDate = new Date(job.scheduled_time)
    jobDate.setHours(0, 0, 0, 0)
    return jobDate.getTime() === today.getTime()
  })

  const activeJobs = myJobs.filter((j) => j.status !== "complete")
  const completedJobs = myJobs.filter((j) => j.status === "complete")

  const handleLogout = () => {
    logoutTechnician()
    router.push("/tech")
  }

  if (!technician) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-sidebar text-sidebar-foreground p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold">Hi, {technician.name}</h1>
            <p className="text-sm text-sidebar-muted">
              {activeJobs.length} active job{activeJobs.length !== 1 ? "s" : ""} today
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="p-4 bg-muted/50 border-b">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold">{todaysJobs.length}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{activeJobs.length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{completedJobs.length}</p>
            <p className="text-xs text-muted-foreground">Done</p>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <main className="p-4 space-y-6">
        {/* Active Jobs */}
        {activeJobs.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              Your Active Jobs
            </h2>
            <div className="space-y-3">
              {activeJobs.map((job) => {
                const scheduledDate = new Date(job.scheduled_time)
                return (
                  <Link key={job.id} href={`/tech/jobs/${job.id}`}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate">
                                {job.customer_name}
                              </h3>
                              <Badge className={statusConfig[job.status].className}>
                                {statusConfig[job.status].label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {job.job_type}
                            </p>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5" />
                                <span>
                                  {scheduledDate.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <div className="flex items-start gap-2">
                                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                <span className="line-clamp-1">
                                  {job.customer_address}
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Completed Jobs */}
        {completedJobs.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              Completed
            </h2>
            <div className="space-y-3">
              {completedJobs.slice(0, 5).map((job) => (
                <Link key={job.id} href={`/tech/jobs/${job.id}`}>
                  <Card className="opacity-75 hover:opacity-100 transition-opacity">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{job.customer_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {job.job_type}
                          </p>
                        </div>
                        <Badge className={statusConfig.complete.className}>
                          Complete
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {myJobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No jobs assigned to you</p>
            <p className="text-sm text-muted-foreground">
              Check back later for new assignments
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
