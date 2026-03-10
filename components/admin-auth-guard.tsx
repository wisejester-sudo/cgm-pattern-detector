"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"

interface AdminAuthGuardProps {
  children: React.ReactNode
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter()
  const { isAdminAuthenticated, currentAdmin } = useStore()

  useEffect(() => {
    // Allow access if admin is authenticated
    // For demo purposes, we start authenticated
    if (!isAdminAuthenticated || !currentAdmin) {
      router.push("/login")
    }
  }, [isAdminAuthenticated, currentAdmin, router])

  // Show nothing while redirecting
  if (!isAdminAuthenticated || !currentAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return <>{children}</>
}
