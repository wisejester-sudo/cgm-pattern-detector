"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Copy, Check, Plus, Search, Link2, UserCheck, UserX, Mail, Phone, MoreHorizontal, Loader2 } from "lucide-react"
import { useStore } from "@/lib/store"
import { toast } from "sonner"
import Link from "next/link"
import type { Technician } from "@/lib/types"
import { SkeletonList } from "@/components/ui/skeleton-card"

interface TechnicianWithMagicLink extends Technician {
  magicLink?: string
}

export default function TechniciansPage() {
  const router = useRouter()
  const { technicians, jobs, loadTechniciansFromSupabase, loadJobsFromSupabase, regenerateMagicLink } = useStore()
  
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null)
  const [showMagicLinkDialog, setShowMagicLinkDialog] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadTechniciansFromSupabase(), loadJobsFromSupabase()])
      setIsLoading(false)
    }
    loadData()
  }, [loadTechniciansFromSupabase, loadJobsFromSupabase])

  // Filter technicians
  const filteredTechnicians = useMemo(() => {
    let filtered = [...technicians]
    
    // Tab filter
    if (activeTab === "active") {
      filtered = filtered.filter((t) => t.is_active)
    } else if (activeTab === "inactive") {
      filtered = filtered.filter((t) => !t.is_active)
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.email?.toLowerCase().includes(query) ||
          t.phone?.includes(query)
      )
    }
    
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [technicians, activeTab, searchQuery])

  // Stats
  const stats = useMemo(() => ({
    total: technicians.length,
    active: technicians.filter((t) => t.is_active).length,
    inactive: technicians.filter((t) => !t.is_active).length,
    withJobs: new Set(jobs.flatMap((j) => j.assigned_tech_ids || [])).size,
  }), [technicians, jobs])

  const handleCopyMagicLink = async () => {
    if (!selectedTech?.magic_link_token) return
    
    const link = `${window.location.origin}/t/${selectedTech.magic_link_token}`
    await navigator.clipboard.writeText(link)
    setCopiedLink(true)
    toast.success("Magic link copied to clipboard")
    
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleGenerateNewLink = async () => {
    if (!selectedTech) return
    
    setIsGeneratingLink(true)
    try {
      await regenerateMagicLink(selectedTech.id)
      toast.success("New magic link generated")
      await loadTechniciansFromSupabase()
    } catch (error) {
      toast.error("Failed to generate link")
    } finally {
      setIsGeneratingLink(false)
    }
  }

  const openMagicLinkDialog = (tech: Technician) => {
    setSelectedTech(tech)
    setShowMagicLinkDialog(true)
    setCopiedLink(false)
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
          <h1 className="text-3xl font-bold tracking-tight">Technicians</h1>
          <p className="text-muted-foreground">Manage your technician team</p>
        </div>
        <Link href="/technicians/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Technician
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Technicians</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">Inactive</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.withJobs}</div>
            <p className="text-xs text-muted-foreground">With Assigned Jobs</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search technicians..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Technicians List */}
      {filteredTechnicians.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No technicians found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try adjusting your search" : "Add your first technician to get started"}
            </p>
            {!searchQuery && (
              <Link href="/technicians/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Technician
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTechnicians.map((tech) => {
            const assignedJobsCount = jobs.filter((j) => 
              j.assigned_tech_ids?.includes(tech.id)
            ).length
            const initials = tech.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
            
            return (
              <Card key={tech.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{tech.name}</h3>
                        <Badge 
                          variant={tech.is_active ? "default" : "secondary"}
                          className="mt-1"
                        >
                          {tech.is_active ? (
                            <><UserCheck className="h-3 w-3 mr-1" /> Active</>
                          ) : (
                            <><UserX className="h-3 w-3 mr-1" /> Inactive</>
                          )}
                        </Badge>
                      </div>
                    </div>
                    {tech.magic_link_token && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openMagicLinkDialog(tech)}
                        title="View Magic Link"
                      >
                        <Link2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    {tech.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{tech.email}</span>
                      </div>
                    )}
                    {tech.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{tech.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{assignedJobsCount} assigned jobs</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <Link href={`/technicians/${tech.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View Profile
                      </Button>
                    </Link>
                    {tech.magic_link_token && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => openMagicLinkDialog(tech)}
                      >
                        <Link2 className="mr-2 h-4 w-4" />
                        Magic Link
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Magic Link Dialog */}
      <Dialog open={showMagicLinkDialog} onOpenChange={setShowMagicLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Magic Link
            </DialogTitle>
            <DialogDescription>
              Share this link with {selectedTech?.name} to give them access without a password.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-md px-3 py-2 text-sm font-mono truncate">
                {selectedTech?.magic_link_token 
                  ? `${typeof window !== 'undefined' ? window.location.origin : ''}/t/${selectedTech.magic_link_token}`
                  : 'No magic link available'}
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopyMagicLink}
                disabled={!selectedTech?.magic_link_token}
              >
                {copiedLink ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="rounded-lg border p-3 text-sm text-muted-foreground bg-muted/50">
              <p className="font-medium text-foreground mb-1">How it works:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Technician clicks the link to access their jobs</li>
                <li>No password or login required</li>
                <li>Link expires after 30 days of inactivity</li>
                <li>Revoke access by deactivating the technician</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleGenerateNewLink}
              disabled={isGeneratingLink}
            >
              {isGeneratingLink && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate New Link
            </Button>
            <Button onClick={() => setShowMagicLinkDialog(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
