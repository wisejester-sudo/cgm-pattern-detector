import sharp from "sharp"

export interface CompressedImage {
  buffer: Buffer
  width: number
  height: number
  size: number
  format: string
}

export interface ImageProcessingOptions {
  maxWidth?: number
  quality?: number
  format?: "webp" | "jpeg" | "png"
  maxSizeBytes?: number
}

const DEFAULT_OPTIONS: ImageProcessingOptions = {
  maxWidth: 1920,
  quality: 80,
  format: "webp",
  maxSizeBytes: 2 * 1024 * 1024, // 2MB for SMS compatibility
}

/**
 * Compress and optimize an image for upload
 */
export async function compressImage(
  input: Buffer | ArrayBuffer,
  options: ImageProcessingOptions = {}
): Promise<CompressedImage> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const inputBuffer = Buffer.isBuffer(input) ? input : Buffer.from(input)

  let image = sharp(inputBuffer)
  const metadata = await image.metadata()

  // Resize if larger than max width
  if (metadata.width && metadata.width > (opts.maxWidth || 1920)) {
    image = image.resize(opts.maxWidth, null, {
      withoutEnlargement: true,
      fit: "inside",
    })
  }

  // Convert to target format with quality
  let outputBuffer: Buffer
  switch (opts.format) {
    case "webp":
      outputBuffer = await image.webp({ quality: opts.quality }).toBuffer()
      break
    case "jpeg":
      outputBuffer = await image.jpeg({ quality: opts.quality }).toBuffer()
      break
    case "png":
      outputBuffer = await image.png({ quality: opts.quality }).toBuffer()
      break
    default:
      outputBuffer = await image.webp({ quality: opts.quality }).toBuffer()
  }

  // If still too large, reduce quality iteratively
  let currentQuality = opts.quality || 80
  while (outputBuffer.length > (opts.maxSizeBytes || 2 * 1024 * 1024) && currentQuality > 20) {
    currentQuality -= 10
    switch (opts.format) {
      case "webp":
        outputBuffer = await sharp(inputBuffer)
          .resize(opts.maxWidth, null, { withoutEnlargement: true, fit: "inside" })
          .webp({ quality: currentQuality })
          .toBuffer()
        break
      case "jpeg":
        outputBuffer = await sharp(inputBuffer)
          .resize(opts.maxWidth, null, { withoutEnlargement: true, fit: "inside" })
          .jpeg({ quality: currentQuality })
          .toBuffer()
        break
      default:
        outputBuffer = await sharp(inputBuffer)
          .resize(opts.maxWidth, null, { withoutEnlargement: true, fit: "inside" })
          .webp({ quality: currentQuality })
          .toBuffer()
    }
  }

  const outputMetadata = await sharp(outputBuffer).metadata()

  return {
    buffer: outputBuffer,
    width: outputMetadata.width || 0,
    height: outputMetadata.height || 0,
    size: outputBuffer.length,
    format: opts.format || "webp",
  }
}

/**
 * Generate a thumbnail from an image
 */
export async function generateThumbnail(
  input: Buffer | ArrayBuffer,
  size: number = 200
): Promise<CompressedImage> {
  const inputBuffer = Buffer.isBuffer(input) ? input : Buffer.from(input)

  const outputBuffer = await sharp(inputBuffer)
    .resize(size, size, {
      fit: "cover",
      position: "center",
    })
    .webp({ quality: 70 })
    .toBuffer()

  const metadata = await sharp(outputBuffer).metadata()

  return {
    buffer: outputBuffer,
    width: metadata.width || size,
    height: metadata.height || size,
    size: outputBuffer.length,
    format: "webp",
  }
}

/**
 * Validate image file
 */
export function validateImageFile(file: { size: number; type: string }): {
  valid: boolean
  error?: string
} {
  const MAX_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]

  if (file.size > MAX_SIZE) {
    return { valid: false, error: "File size must be less than 10MB" }
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "Only JPEG, PNG, WebP, and HEIC images are allowed" }
  }

  return { valid: true }
}
