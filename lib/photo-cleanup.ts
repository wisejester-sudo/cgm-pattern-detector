import { createClient } from "@/lib/supabase/server"

/**
 * Clean up photos older than 45 days
 * This function should be called by a cron job (e.g., daily)
 * @returns {Promise<{ deleted: number; errors: string[] }>}
 */
export async function cleanupOldPhotos(): Promise<{ deleted: number; errors: string[] }> {
  const errors: string[] = []
  let deleted = 0

  try {
    const supabase = await createClient()
    if (!supabase) {
      throw new Error("Supabase client not available")
    }

    // Calculate cutoff date (45 days ago)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 45)
    const cutoffISO = cutoffDate.toISOString()

    console.log(`[Cleanup] Deleting photos older than ${cutoffISO}`)

    // Get photos older than 45 days
    const { data: oldPhotos, error: fetchError } = await supabase
      .from("photos")
      .select("id, url, thumbnail_url")
      .lt("created_at", cutoffISO)

    if (fetchError) {
      throw new Error(`Failed to fetch old photos: ${fetchError.message}`)
    }

    if (!oldPhotos || oldPhotos.length === 0) {
      console.log("[Cleanup] No photos to delete")
      return { deleted: 0, errors: [] }
    }

    console.log(`[Cleanup] Found ${oldPhotos.length} photos to delete`)

    // Delete each photo from storage and database
    for (const photo of oldPhotos) {
      try {
        // Extract storage paths from URLs
        const fullImagePath = extractStoragePath(photo.url)
        const thumbnailPath = photo.thumbnail_url
          ? extractStoragePath(photo.thumbnail_url)
          : null

        // Delete full image from storage
        if (fullImagePath) {
          const { error: storageError } = await supabase.storage
            .from("photos")
            .remove([fullImagePath])

          if (storageError) {
            console.error(`[Cleanup] Failed to delete full image ${photo.id}:`, storageError)
            errors.push(`Failed to delete full image ${photo.id}: ${storageError.message}`)
          }
        }

        // Delete thumbnail from storage
        if (thumbnailPath) {
          const { error: thumbError } = await supabase.storage
            .from("photos")
            .remove([thumbnailPath])

          if (thumbError) {
            console.error(`[Cleanup] Failed to delete thumbnail ${photo.id}:`, thumbError)
            errors.push(`Failed to delete thumbnail ${photo.id}: ${thumbError.message}`)
          }
        }

        // Delete database record
        const { error: dbError } = await supabase
          .from("photos")
          .delete()
          .eq("id", photo.id)

        if (dbError) {
          console.error(`[Cleanup] Failed to delete photo record ${photo.id}:`, dbError)
          errors.push(`Failed to delete photo record ${photo.id}: ${dbError.message}`)
        } else {
          deleted++
          console.log(`[Cleanup] Deleted photo ${photo.id}`)
        }
      } catch (err) {
        const errorMsg = `Error processing photo ${photo.id}: ${err instanceof Error ? err.message : String(err)}`
        console.error(`[Cleanup] ${errorMsg}`)
        errors.push(errorMsg)
      }
    }

    console.log(`[Cleanup] Completed. Deleted ${deleted}/${oldPhotos.length} photos`)
    return { deleted, errors }
  } catch (error) {
    const errorMsg = `Cleanup failed: ${error instanceof Error ? error.message : String(error)}`
    console.error(`[Cleanup] ${errorMsg}`)
    errors.push(errorMsg)
    return { deleted, errors }
  }
}

/**
 * Extract storage path from Supabase storage public URL
 * @param url - Public URL
 * @returns string | null - Storage path or null if parsing fails
 */
function extractStoragePath(url: string): string | null {
  try {
    // URL format: https://{project}.supabase.co/storage/v1/object/public/photos/{path}
    const urlObj = new URL(url)
    const pathMatch = urlObj.pathname.match(/\/object\/public\/photos\/(.+)/)
    return pathMatch ? pathMatch[1] : null
  } catch {
    return null
  }
}
