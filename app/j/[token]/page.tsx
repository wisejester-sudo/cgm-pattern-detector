"use client"

import { useEffect, useState, use } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Clock, 
  Truck, 
  Wrench, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  X
} from "lucide-react"
import type { JobStatus } from "@/lib/types"

interface JobData {
  id: string
  job_type: string
  status: JobStatus
  technician_name: string | null
  last_updated: string
}

interface PhotoData {
  id: string
  photo_url: string
  thumbnail_url?: string
  caption: string | null
  uploaded_at: string
}

interface UpdateData {
  id: string
  status: string
  notes: string | null
  photos: string[]
  created_at: string
}

interface CompanyData {
  company_name: string
  logo_url: string | null
  primary_color: string
  tagline: string | null
}

interface PublicJobData {
  job: JobData
  updates: UpdateData[]
  photos: PhotoData[]
  company: CompanyData
}

const statusConfig: Record<JobStatus, { label: string; icon: React.ElementType; className: string }> = {
  available: { label: "Available", icon: Clock, className: "bg-slate-100 text-slate-800" },
  scheduled: { label: "Scheduled", icon: Clock, className: "bg-blue-100 text-blue-800" },
  en_route: { label: "On the Way", icon: Truck, className: "bg-yellow-100 text-yellow-800" },
  working: { label: "In Progress", icon: Wrench, className: "bg-orange-100 text-orange-800" },
  on_hold: { label: "On Hold", icon: Clock, className: "bg-amber-100 text-amber-800" },
  complete: { label: "Completed", icon: CheckCircle, className: "bg-green-100 text-green-800" },
}

export default function PublicJobViewerPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [data, setData] = useState<PublicJobData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)

  useEffect(() => {
    fetchJobData()
  }, [token])

  async function fetchJobData() {
    try {
      const res = await fetch(`/api/public/job/${token}`)
      
      if (!res.ok) {
        const errorData = await res.json()
        setError(errorData.error || "Failed to load job details")
        setLoading(false)
        return
      }

      const jobData = await res.json()
      setData(jobData)
    } catch {
      setError("Failed to load job details")
    } finally {
      setLoading(false)
    }
  }

  function formatTime(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", { 
      hour: "numeric", 
      minute: "2-digit",
      hour12: true 
    })
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: "numeric"
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Link Not Available</h2>
            <p className="text-muted-foreground">{error || "This link is no longer valid."}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { job, updates, photos, company } = data
  const StatusIcon = statusConfig[job.status].icon

  return (
    <div className="min-h-screen bg-background">
      {/* Header with company branding */}
      <header 
        className="p-4 text-white"
        style={{ backgroundColor: company.primary_color }}
      >
        <div className="max-w-md mx-auto flex items-center gap-3">
          {company.logo_url ? (
            <img 
              src={company.logo_url} 
              alt={company.company_name}
              className="h-10 w-10 rounded-lg object-contain bg-white p-1"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Wrench className="h-5 w-5" />
            </div>
          )}
          <div>
            <h1 className="font-semibold">{company.company_name}</h1>
            {company.tagline && (
              <p className="text-sm opacity-80">{company.tagline}</p>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* Status Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Service</p>
                <p className="font-medium">{job.job_type}</p>
              </div>
              <Badge className={`${statusConfig[job.status].className} text-sm`}>
                <StatusIcon className="h-4 w-4 mr-1" />
                {statusConfig[job.status].label}
              </Badge>
            </div>
            
            {job.technician_name && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-medium">
                    {job.technician_name.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                <span>Technician: {job.technician_name}</span>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-4">
              Last updated: {formatDate(job.last_updated)} at {formatTime(job.last_updated)}
            </p>
          </CardContent>
        </Card>

        {/* Photos Gallery */}
        {photos.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-3">Photos</h2>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhotoIndex(index)}
                    className="aspect-square rounded-lg overflow-hidden bg-muted hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={photo.thumbnail_url || photo.photo_url}
                      alt={photo.caption || `Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Updates Timeline */}
        {updates.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-3">Updates</h2>
              <div className="space-y-4">
                {updates.map((update, index) => (
                  <div 
                    key={update.id} 
                    className={`relative pl-6 ${index !== updates.length - 1 ? "pb-4 border-l-2 border-muted ml-2" : "ml-2"}`}
                  >
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {update.status.replace("_", " ")}
                      </p>
                      {update.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{update.notes}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(update.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reply CTA */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="font-medium mb-1">Questions?</p>
            <p className="text-sm text-muted-foreground mb-3">
              Reply to the text message you received
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="text-center py-6 text-xs text-muted-foreground">
          Powered by <span className="font-medium">Dispatchly</span>
        </footer>
      </main>

      {/* Fullscreen Photo Viewer */}
      {selectedPhotoIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Close button */}
          <button
            onClick={() => setSelectedPhotoIndex(null)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Photo */}
          <div className="flex-1 flex items-center justify-center p-4">
            <img
              src={photos[selectedPhotoIndex].photo_url}
              alt={photos[selectedPhotoIndex].caption || `Photo ${selectedPhotoIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Navigation */}
          {photos.length > 1 && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 pointer-events-none">
              <Button
                variant="ghost"
                size="icon"
                className="pointer-events-auto rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={() => setSelectedPhotoIndex(prev => 
                  prev !== null ? (prev - 1 + photos.length) % photos.length : 0
                )}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="pointer-events-auto rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={() => setSelectedPhotoIndex(prev => 
                  prev !== null ? (prev + 1) % photos.length : 0
                )}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          )}

          {/* Photo info */}
          <div className="p-4 bg-black/80 text-white text-center">
            <p className="text-sm">
              {selectedPhotoIndex + 1} of {photos.length}
            </p>
            {photos[selectedPhotoIndex].caption && (
              <p className="text-sm text-white/70 mt-1">
                {photos[selectedPhotoIndex].caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
