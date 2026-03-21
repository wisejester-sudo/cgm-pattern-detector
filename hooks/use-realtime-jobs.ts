"use client"

import { useEffect, useCallback } from "react"
import { useStore } from "@/lib/store"
import { supabase } from "@/lib/supabase"

export function useRealtimeJobs() {
  const { loadJobsFromSupabase, currentTechId } = useStore()

  const refreshJobs = useCallback(() => {
    loadJobsFromSupabase()
  }, [loadJobsFromSupabase])

  useEffect(() => {
    if (!currentTechId) return

    // Subscribe to job changes
    const subscription = supabase
      .channel("jobs-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "jobs",
        },
        (payload) => {
          console.log("Job change detected:", payload)
          refreshJobs()
        }
      )
      .subscribe()

    // Subscribe to status updates
    const statusSubscription = supabase
      .channel("status-updates-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "status_updates",
        },
        (payload) => {
          console.log("Status update detected:", payload)
          refreshJobs()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
      statusSubscription.unsubscribe()
    }
  }, [currentTechId, refreshJobs])
}
