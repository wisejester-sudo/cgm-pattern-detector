'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

export function SetupGuard({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true)
  const [setupComplete, setSetupComplete] = useState(false)

  useEffect(() => {
    checkSetupStatus()
  }, [])

  const checkSetupStatus = async () => {
    try {
      const response = await fetch('/api/auth/user-role')
      
      // If API returns 503 (Supabase not configured) or other errors, allow demo mode
      if (!response.ok) {
        setSetupComplete(true)
        setIsChecking(false)
        return
      }

      const data = await response.json()

      // All users (admin, technician, or demo) can access dashboard
      // Setup is now handled during signup, not in a separate flow
      if (data.role === 'admin' || data.role === 'technician' || data.error) {
        setSetupComplete(true)
      } else {
        // No role - allow demo mode
        setSetupComplete(true)
      }
    } catch {
      // Allow demo mode on error
      setSetupComplete(true)
    } finally {
      setIsChecking(false)
    }
  }

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!setupComplete) {
    return null
  }

  return <>{children}</>
}
