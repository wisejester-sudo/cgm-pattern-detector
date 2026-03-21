"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Camera, X, Upload, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface PhotoUploadProps {
  onUpload: (file: File) => Promise<void>
  maxSize?: number // in MB
  className?: string
}

type UploadState = "idle" | "uploading" | "success" | "error"

export function PhotoUpload({ onUpload, maxSize = 10, className }: PhotoUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(null)

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) {
      return "Please select an image file"
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`
    }
    return null
  }

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Validate file
      const error = validateFile(file)
      if (error) {
        toast.error(error)
        return
      }

      // Show preview
      const reader = new FileReader()
      reader.onload = () => setPreview(reader.result as string)
      reader.readAsDataURL(file)

      // Start upload
      setUploadState("uploading")
      setProgress(0)

      // Simulate progress (in real app, this would track actual upload progress)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      try {
        await onUpload(file)
        clearInterval(progressInterval)
        setProgress(100)
        setUploadState("success")
        toast.success("Photo uploaded successfully")
        
        // Reset after success
        setTimeout(() => {
          setUploadState("idle")
          setProgress(0)
          setPreview(null)
        }, 2000)
      } catch (error) {
        clearInterval(progressInterval)
        setUploadState("error")
        toast.error("Failed to upload photo")
      }
    },
    [onUpload, maxSize]
  )

  const clearPreview = () => {
    setPreview(null)
    setUploadState("idle")
    setProgress(0)
  }

  return (
    <div className={cn("relative", className)}>
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          {uploadState === "uploading" && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center rounded-lg p-4">
              <Upload className="h-8 w-8 text-white mb-2 animate-bounce" />
              <Progress value={progress} className="w-full max-w-xs" />
              <p className="text-white text-sm mt-2">{progress}%</p>
            </div>
          )}
          {uploadState === "success" && (
            <div className="absolute inset-0 bg-green-500/50 flex items-center justify-center rounded-lg">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          )}
          {uploadState === "error" && (
            <div className="absolute inset-0 bg-red-500/50 flex flex-col items-center justify-center rounded-lg p-4">
              <AlertCircle className="h-8 w-8 text-white mb-2" />
              <p className="text-white text-sm text-center">Upload failed</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={clearPreview}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          )}
          {uploadState === "idle" && (
            <button
              onClick={clearPreview}
              className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
          <Camera className="h-8 w-8 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground">Click to add photo</span>
          <span className="text-xs text-muted-foreground mt-1">Max {maxSize}MB</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploadState === "uploading"}
          />
        </label>
      )}
    </div>
  )
}
