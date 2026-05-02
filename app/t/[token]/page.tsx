"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  Briefcase,
  MessageSquare,
  Image,
  Loader2,
  CheckCircle,
  Camera,
  Send
} from "lucide-react"
import type { Job, JobStatus } from "@/lib/types"

interface TechPortalPageProps {
  params: Promise<{ token: string }>
}

interface TechnicianSession {
  id: string
  name: string
}

const statusConfig: Record<JobStatus, { label: string; className: string; nextLabel: string }> = {
  available: { label: "Available", className: "bg-blue-100 text-blue-800", nextLabel: "Accept Job" },
  scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-800", nextLabel: "Start Travel" },
  en_route: { label: "En Route", className: "bg-yellow-100 text-yellow-800", nextLabel: "Start Work" },
  working: { label: "Working", className: "bg-green-100 text-green-800", nextLabel: "Complete Job" },
  on_hold: { label: "On Hold", className: "bg-amber-100 text-amber-800", nextLabel: "Resume Work" },
  complete: { label: "Complete", className: "bg-gray-100 text-gray-800", nextLabel: "" },
}

const statusFlow: JobStatus[] = ["scheduled", "en_route", "working", "complete"]

export default function TechPortalPage({ params }: TechPortalPageProps) {
  const { token } = use(params)
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState("")
  const [technician, setTechnician] = useState<TechnicianSession | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [updateNotes, setUpdateNotes] = useState("")
  const [messageText, setMessageText] = useState("")

  // Validate token and load data
  useEffect(() => {
    const validateAndLoad = async () => {
      try {
        const validateResponse = await fetch('/api/auth/validate-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        if (!validateResponse.ok) {
          setError('Invalid or expired link')
          setIsLoading(false)
          return
        }

        const techData = await validateResponse.json()
        setTechnician(techData)

        if (typeof window !== 'undefined') {
          localStorage.setItem('tech_magic_token', token)
        }

        // Load assigned jobs
        const jobsResponse = await fetch(`/api/technicians/${techData.id}/jobs`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })

        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json()
          setJobs(jobsData.jobs || [])
          if (jobsData.jobs?.length > 0) {
            setActiveJobId(jobsData.jobs[0].id)
          }
        }

        setIsLoading(false)
      } catch (err) {
        console.error('[TechPortal] Error:', err)
        setError('Failed to load data')
        setIsLoading(false)
      }
    }

    validateAndLoad()
  }, [token])

  const activeJob = jobs.find((j) => j.id === activeJobId)

  const handleStatusUpdate = async (newStatus: JobStatus) => {
    if (!activeJob) return
    
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/jobs/${activeJob.id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus,
          notes: updateNotes 
        }),
      })

      if (!response.ok) throw new Error('Failed to update status')

      setJobs((prev) => 
        prev.map((j) => 
          j.id === activeJob.id 
            ? { ...j, status: newStatus, updated_at: new Date().toISOString() }
            : j
        )
      )

      toast.success(`Status updated to ${statusConfig[newStatus].label}`)
      setShowUpdateDialog(false)
      setUpdateNotes("")
    } catch (err) {
      console.error('[TechPortal] Error updating status:', err)
      toast.error('Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSendMessage = async () => {
    if (!activeJob || !messageText.trim()) return
    
    try {
      const response = await fetch(`/api/jobs/${activeJob.id}/updates`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: messageText }),
      })

      if (!response.ok) throw new Error('Failed to send message')

      toast.success('Message sent')
      setMessageText("")
    } catch (err) {
      toast.error('Failed to send message')
    }
  }

  const getNextStatus = (currentStatus: JobStatus): JobStatus | null => {
    const currentIndex = statusFlow.indexOf(currentStatus)
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) return null
    return statusFlow[currentIndex + 1]
  }

  const getStatusButton = () => {
    if (!activeJob) return null
    
    const nextStatus = getNextStatus(activeJob.status)
    if (!nextStatus) return null

    const config = statusConfig[nextStatus]
    
    return (
      <Button
        onClick={() => setShowUpdateDialog(true)}
        disabled={isUpdating}
        className="w-full"
      >
        {isUpdating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle className="mr-2 h-4 w-4" />
        )}
        {config.nextLabel}
      </Button>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl">Access Error</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-center text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground">
              Please contact your administrator for assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">{technician?.name}</p>
              <p className="text-xs text-muted-foreground">Technician Portal</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => {
            localStorage.removeItem('tech_magic_token')
            router.push('/')
          }}>
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Assigned Jobs</h2>
              <p className="text-muted-foreground text-center max-w-md">
                You don&apos;t have any jobs assigned yet. Your administrator will assign jobs to you.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Job Selector */}
            {jobs.length > 1 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Your Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {jobs.map((job) => (
                      <Button
                        key={job.id}
                        variant={activeJobId === job.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveJobId(job.id)}
                        className="whitespace-nowrap"
                      >
                        {job.customer_name}
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {statusConfig[job.status].label}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeJob && (
              <>
                {/* Job Header Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{activeJob.customer_name}</CardTitle>
                        <CardDescription>{activeJob.job_type}</CardDescription>
                      </div>
                      <Badge className={statusConfig[activeJob.status].className}>
                        {statusConfig[activeJob.status].label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Scheduled</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(activeJob.scheduled_time).toLocaleDateString()} at{' '}
                            {new Date(activeJob.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Customer Phone</p>
                          <p className="text-sm text-muted-foreground">{activeJob.customer_phone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 sm:col-span-2">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Address</p>
                          <p className="text-sm text-muted-foreground">{activeJob.customer_address}</p>
                        </div>
                      </div>
                    </div>

                    {activeJob.notes && (
                      <div className="pt-4 border-t">
                        <p className="font-medium mb-1">Notes</p>
                        <p className="text-sm text-muted-foreground">{activeJob.notes}</p>
                      </div>
                    )}

                    {/* Status Update Button */}
                    <div className="pt-4 border-t">
                      {getStatusButton()}
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="messages" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="messages">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Messages
                    </TabsTrigger>
                    <TabsTrigger value="photos">
                      <Camera className="h-4 w-4 mr-2" />
                      Photos
                    </TabsTrigger>
                    <TabsTrigger value="details">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Details
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="messages">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Messages</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Send a message to the customer..."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            rows={2}
                          />
                          <Button 
                            size="icon" 
                            className="shrink-0"
                            onClick={handleSendMessage}
                            disabled={!messageText.trim()}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Messages will be sent via SMS to the customer.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="photos">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Photo Upload</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="p-6 border-2 border-dashed rounded-lg text-center">
                          <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="font-medium mb-2">Upload Photos</p>
                          <p className="text-sm text-muted-foreground mb-4">
                            Take photos of the work site, issues, or completed work
                          </p>
                          <Button>
                            <Camera className="mr-2 h-4 w-4" />
                            Take Photo
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="details">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Job Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Job ID</span>
                            <span className="font-mono">{activeJob.id.slice(0, 8)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Created</span>
                            <span>{new Date(activeJob.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Updated</span>
                            <span>{new Date(activeJob.updated_at).toLocaleDateString()}</span>
                          </div>
                          {activeJob.on_hold_reason && (
                            <div className="pt-4 border-t">
                              <span className="text-muted-foreground">On Hold Reason:</span>
                              <p className="mt-1 text-amber-600">{activeJob.on_hold_reason}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        )}
      </main>

      {/* Status Update Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Job Status</DialogTitle>
            <DialogDescription>
              Add any notes about this status change (optional)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="e.g., Arrived at location, Started repair work..."
              value={updateNotes}
              onChange={(e) => setUpdateNotes(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                const nextStatus = activeJob ? getNextStatus(activeJob.status) : null
                if (nextStatus) handleStatusUpdate(nextStatus)
              }}
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
