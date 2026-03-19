"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import {
  Camera,
  Download,
  ArrowLeft,
  ImageIcon,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Photo {
  id: string
  url: string
  thumbnail_url?: string
  created_at: string
  update_id: string
}

interface JobDetails {
  id: string
  customer_name: string
  job_type: string
  status: string
  company_name?: string
}

export default function PhotoViewerPage() {
  const searchParams = useSearchParams()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  const photoId = searchParams?.get("photo")
  const jobId = searchParams?.get("job")
  const token = searchParams?.get("token")

  useEffect(() => {
    if (jobId) {
      fetchPhotos()
    } else {
      setError("Missing job ID")
      setLoading(false)
    }
  }, [jobId])

  async function fetchPhotos() {
    try {
      setLoading(true)
      const supabase = createClient()

      // Verify the token (in production, validate against database)
      // For now, we'll fetch photos if jobId is provided

      // Fetch job details
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select(`
          id,
          customer_name,
          job_type,
          status,
          companies (name)
        `)
        .eq("id", jobId)
        .single()

      if (jobError || !jobData) {
        setError("Job not found or access denied")
        setLoading(false)
        return
      }

      setJobDetails({
        id: jobData.id,
        customer_name: jobData.customer_name,
        job_type: jobData.job_type,
        status: jobData.status,
        company_name: jobData.companies?.name,
      })

      // Fetch photos for this job
      const { data: photosData, error: photosError } = await supabase
        .from("photos")
        .select(`
          id,
          url,
          thumbnail_url,
          created_at,
          update_id
        `)
        .in(
          "update_id",
          supabase
            .from("updates")
            .select("id")
            .eq("job_id", jobId)
        )
        .order("created_at", { ascending: false })

      if (photosError) {
        console.error("Error fetching photos:", photosError)
        setError("Failed to load photos")
        setLoading(false)
        return
      }

      setPhotos(photosData || [])

      // If a specific photo ID was provided, select it
      if (photoId && photosData) {
        const photo = photosData.find((p: Photo) => p.id === photoId)
        if (photo) {
          setSelectedPhoto(photo)
        }
      }
    } catch (err) {
      console.error("Error:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  function handleDownload(photo: Photo) {
    // Create a temporary link to download the image
    const link = document.createElement("a")
    link.href = photo.url
    link.download = `photo-${photo.id}.jpg`
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Photos Yet</h2>
              <p className="text-muted-foreground">
                No photos have been uploaded for this job yet.
              </p>
              {jobDetails && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="font-medium">{jobDetails.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{jobDetails.job_type}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Job Photos</h1>
              {jobDetails && (
                <p className="text-sm text-muted-foreground">
                  {jobDetails.customer_name} • {jobDetails.job_type}
                </p>
              )}
            </div>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Camera className="h-3 w-3" />
            {photos.length} photo{photos.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {selectedPhoto ? (
          // Single Photo View
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setSelectedPhoto(null)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Gallery
              </Button>
              <Button onClick={() => handleDownload(selectedPhoto)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black">
                  <Image
                    src={selectedPhoto.url}
                    alt="Job photo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Uploaded {new Date(selectedPhoto.created_at).toLocaleString()}
              </span>
              <Badge variant="outline">Photo ID: {selectedPhoto.id.slice(0, 8)}</Badge>
            </div>
          </div>
        ) : (
          // Gallery Grid View
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <Card
                key={photo.id}
                className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                onClick={() => setSelectedPhoto(photo)}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-square bg-muted">
                    <Image
                      src={photo.thumbnail_url || photo.url}
                      alt="Job photo thumbnail"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Job Info Footer */}
        {jobDetails && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-medium">{jobDetails.customer_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Job Type</span>
                <span className="font-medium">{jobDetails.job_type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant={
                    jobDetails.status === "complete"
                      ? "default"
                      : jobDetails.status === "working"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {jobDetails.status}
                </Badge>
              </div>
              {jobDetails.company_name && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Company</span>
                  <span className="font-medium">{jobDetails.company_name}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
