'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function SetupGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [setupComplete, setSetupComplete] = useState(false)

  useEffect(() => {
    checkSetupStatus()
  }, [])

  const checkSetupStatus = async () => {
    try {
      const response = await fetch('/api/auth/user-role')
      const data = await response.json()

      if (data.role === 'admin' && data.user?.company) {
        if (!data.user.company.setup_completed) {
          router.push('/setup')
          return
        }
        setSetupComplete(true)
      } else if (data.role === 'technician') {
        setSetupComplete(true)
      } else {
        router.push('/auth/login')
        return
      }
    } catch (error) {
      console.error('Error checking setup status:', error)
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
