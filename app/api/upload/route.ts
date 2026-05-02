import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { compressImage, generateThumbnail, validateImageFile } from "@/lib/image-processing"
import { checkRateLimit, getClientIdentifier, rateLimitConfigs } from "@/lib/rate-limit"

export const dynamic = 'force-dynamic'

// POST /api/upload - Upload and process an image
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 uploads per minute per user
    const identifier = getClientIdentifier(request)
    const rateLimit = checkRateLimit(`upload:${identifier}`, rateLimitConfigs.upload)
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Upload rate limit exceeded. Please try again later.",
          retryAfter: rateLimit.retryAfter 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
            'Retry-After': rateLimit.retryAfter?.toString() || '60',
          }
        }
      )
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      )
    }

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const jobId = formData.get("job_id") as string | null

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file
    const validation = validateImageFile({ size: file.size, type: file.type })
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Read file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Compress image
    const compressed = await compressImage(buffer, {
      maxWidth: 1920,
      quality: 80,
      format: "webp",
      maxSizeBytes: 2 * 1024 * 1024,
    })

    // Generate thumbnail
    const thumbnail = await generateThumbnail(buffer, 200)

    // Generate unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const filename = `${timestamp}-${randomId}.webp`
    const thumbnailFilename = `${timestamp}-${randomId}-thumb.webp`

    // Determine storage path
    const basePath = jobId ? `jobs/${jobId}` : `uploads/${user.id}`

    // Upload compressed image
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("photos")
      .upload(`${basePath}/${filename}`, compressed.buffer, {
        contentType: "image/webp",
        upsert: false,
      })

    if (uploadError) {
      console.error("[API] Error uploading image:", uploadError)
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      )
    }

    // Upload thumbnail
    const { error: thumbError } = await supabase.storage
      .from("photos")
      .upload(`${basePath}/${thumbnailFilename}`, thumbnail.buffer, {
        contentType: "image/webp",
        upsert: false,
      })

    if (thumbError) {
      console.error("[API] Error uploading thumbnail:", thumbError)
      // Continue even if thumbnail fails
    }

    // Get public URLs
    const { data: urlData } = supabase.storage
      .from("photos")
      .getPublicUrl(`${basePath}/${filename}`)

    const { data: thumbUrlData } = supabase.storage
      .from("photos")
      .getPublicUrl(`${basePath}/${thumbnailFilename}`)

    // Store in job_photos table if job_id provided
    if (jobId) {
      await supabase
        .from("job_photos")
        .insert({
          job_id: jobId,
          photo_url: urlData.publicUrl,
          thumbnail_url: thumbUrlData.publicUrl,
          caption: null,
        })
    }

    return NextResponse.json({
      url: urlData.publicUrl,
      thumbnail_url: thumbUrlData.publicUrl,
      size: compressed.size,
      width: compressed.width,
      height: compressed.height,
      path: uploadData.path,
    })
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
