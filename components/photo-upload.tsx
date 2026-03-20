"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Camera, Upload, X, Loader2, CheckCircle, AlertCircle } from "lucide-react"

interface PhotoUploadProps {
  jobId?: string
  onUploadComplete?: (urls: string[]) => void
  maxPhotos?: number
  className?: string
}

interface UploadingFile {
  id: string
  file: File
  preview: string
  progress: number
  status: "pending" | "uploading" | "complete" | "error"
  url?: string
  error?: string
}

export function PhotoUpload({ 
  jobId, 
  onUploadComplete, 
  maxPhotos = 5,
  className 
}: PhotoUploadProps) {
  const [files, setFiles] = useState<UploadingFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles: UploadingFile[] = []
    const remainingSlots = maxPhotos - files.length

    for (let i = 0; i < Math.min(selectedFiles.length, remainingSlots); i++) {
      const file = selectedFiles[i]
      
      // Validate file type
      if (!file.type.startsWith("image/")) {
        continue
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        continue
      }

      newFiles.push({
        id: `${Date.now()}-${i}`,
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: "pending",
      })
    }

    setFiles(prev => [...prev, ...newFiles])
  }, [files.length, maxPhotos])

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== id)
    })
  }, [])

  const uploadFile = async (uploadingFile: UploadingFile): Promise<string | null> => {
    const formData = new FormData()
    formData.append("file", uploadingFile.file)
    if (jobId) {
      formData.append("job_id", jobId)
    }

    try {
      // Update progress
      setFiles(prev => 
        prev.map(f => 
          f.id === uploadingFile.id 
            ? { ...f, status: "uploading" as const, progress: 10 }
            : f
        )
      )

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()

      // Update to complete
      setFiles(prev => 
        prev.map(f => 
          f.id === uploadingFile.id 
            ? { ...f, status: "complete" as const, progress: 100, url: data.url }
            : f
        )
      )

      return data.url
    } catch (error) {
      // Update to error
      setFiles(prev => 
        prev.map(f => 
          f.id === uploadingFile.id 
            ? { ...f, status: "error" as const, error: "Upload failed" }
            : f
        )
      )
      return null
    }
  }

  const uploadAllFiles = async () => {
    const pendingFiles = files.filter(f => f.status === "pending")
    if (pendingFiles.length === 0) return

    setIsUploading(true)

    const uploadPromises = pendingFiles.map(f => uploadFile(f))
    const results = await Promise.all(uploadPromises)
    const successfulUrls = results.filter((url): url is string => url !== null)

    setIsUploading(false)

    if (onUploadComplete && successfulUrls.length > 0) {
      onUploadComplete(successfulUrls)
    }
  }

  const pendingCount = files.filter(f => f.status === "pending").length
  const completeCount = files.filter(f => f.status === "complete").length
  const canAddMore = files.length < maxPhotos

  // Cleanup object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
  }, [])

  return (
    <div className={className}>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Action buttons */}
      {canAddMore && (
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => cameraInputRef.current?.click()}
            aria-label="Take photo with camera"
          >
            <Camera className="h-4 w-4 mr-2" aria-hidden="true" />
            Camera
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Select photos from gallery"
          >
            <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
            Gallery
          </Button>
        </div>
      )}

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {files.map((file) => (
            <div 
              key={file.id} 
              className="relative aspect-square rounded-lg overflow-hidden bg-muted"
            >
              <img
                src={file.preview}
                alt={`Photo upload preview ${file.id}`}
                className="w-full h-full object-cover"
              />
              
              {/* Status overlay */}
              {file.status === "uploading" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
              
              {file.status === "complete" && (
                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              )}
              
              {file.status === "error" && (
                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
              )}

              {/* Remove button (only for pending) */}
              {file.status === "pending" && (
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  aria-label={`Remove photo ${file.id}`}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}

              {/* Progress bar */}
              {file.status === "uploading" && (
                <div className="absolute bottom-0 left-0 right-0">
                  <Progress value={file.progress} className="h-1 rounded-none" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload status */}
      {files.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>
            {files.length} of {maxPhotos} photos
            {completeCount > 0 && ` (${completeCount} uploaded)`}
          </span>
        </div>
      )}

      {/* Upload button */}
      {pendingCount > 0 && (
        <Button
          type="button"
          className="w-full"
          disabled={isUploading}
          onClick={uploadAllFiles}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload {pendingCount} Photo{pendingCount !== 1 ? "s" : ""}
            </>
          )}
        </Button>
      )}
    </div>
  )
}
