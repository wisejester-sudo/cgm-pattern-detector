'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

export function SetupGuard({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true)
  const [setupComplete, setSetupComplete] = useState(false)

  useEffect(() => {
    // Check localStorage first to see if we already verified setup
    const cachedSetup = localStorage.getItem('dispatchly_setup_verified')
    if (cachedSetup === 'true') {
      setSetupComplete(true)
      setIsChecking(false)
      return
    }
    
    checkSetupStatus()
  }, [])

  const checkSetupStatus = async () => {
    // Fast timeout - don't wait long
    const timeoutId = setTimeout(() => {
      console.log('[SetupGuard] Timeout - allowing access')
      setSetupComplete(true)
      setIsChecking(false)
    }, 2000) // 2 second timeout (was 5)

    try {
      const response = await fetch('/api/auth/user-role')
      
      clearTimeout(timeoutId)
      
      // Cache success in localStorage
      localStorage.setItem('dispatchly_setup_verified', 'true')
      
      if (!response.ok) {
        setSetupComplete(true)
        setIsChecking(false)
        return
      }

      const data = await response.json()

      if (data.role === 'admin' || data.role === 'technician' || data.error) {
        setSetupComplete(true)
      } else {
        setSetupComplete(true)
      }
    } catch {
      clearTimeout(timeoutId)
      localStorage.setItem('dispatchly_setup_verified', 'true')
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

// Helper to clear setup cache (call on logout)
export function clearSetupCache() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('dispatchly_setup_verified')
  }
}
