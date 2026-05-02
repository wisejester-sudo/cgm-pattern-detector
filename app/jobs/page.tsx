"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { JobCard } from "@/components/job-card"
import { EmptyJobs } from "@/components/empty-state"
import { SkeletonList } from "@/components/ui/skeleton-card"
import { useStore } from "@/lib/store"
import { Plus, Search, Filter, Calendar, MapPin, Phone } from "lucide-react"
import Link from "next/link"
import type { JobStatus, Job } from "@/lib/types"

const statusFilters: { value: JobStatus | "all"; label: string }[] = [
  { value: "all", label: "All Jobs" },
  { value: "scheduled", label: "Scheduled" },
  { value: "en_route", label: "En Route" },
  { value: "working", label: "Working" },
  { value: "on_hold", label: "On Hold" },
  { value: "complete", label: "Complete" },
]

export default function JobsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { jobs, technicians, loadJobsFromSupabase, loadTechniciansFromSupabase, updateJobStatus } = useStore()
  
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">(
    (searchParams.get("status") as JobStatus | "all") || "all"
  )

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadJobsFromSupabase(), loadTechniciansFromSupabase()])
      setIsLoading(false)
    }
    loadData()
  }, [loadJobsFromSupabase, loadTechniciansFromSupabase])

  // Filter jobs based on search and status
  const filteredJobs = useMemo(() => {
    let filtered = [...jobs]
    
    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((job) => job.status === statusFilter)
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (job) =>
          job.customer_name.toLowerCase().includes(query) ||
          job.customer_phone.includes(query) ||
          job.customer_address.toLowerCase().includes(query) ||
          job.job_type.toLowerCase().includes(query)
      )
    }
    
    // Sort by scheduled time (newest first)
    return filtered.sort((a, b) => 
      new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime()
    )
  }, [jobs, statusFilter, searchQuery])

  // Stats
  const stats = useMemo(() => ({
    total: jobs.length,
    scheduled: jobs.filter((j) => j.status === "scheduled").length,
    inProgress: jobs.filter((j) => j.status === "en_route" || j.status === "working").length,
    onHold: jobs.filter((j) => j.status === "on_hold").length,
    complete: jobs.filter((j) => j.status === "complete").length,
  }), [jobs])

  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    await updateJobStatus(jobId, newStatus)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is already reactive via useMemo
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <SkeletonList />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground">Manage and track all your service jobs</p>
        </div>
        <Link href="/jobs/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Job
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600">{stats.onHold}</div>
            <p className="text-xs text-muted-foreground">On Hold</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.complete}</div>
            <p className="text-xs text-muted-foreground">Complete</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer, phone, address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as JobStatus | "all")}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <EmptyJobs />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => {
            const assignedTechs = job.assigned_tech_ids
              ? technicians.filter((t) => job.assigned_tech_ids?.includes(t.id))
              : []
            
            return (
              <JobCard
                key={job.id}
                job={job}
                technicians={assignedTechs}
                onStatusChange={handleStatusChange}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
