"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"
import { SetupGuard } from "@/components/setup-guard"
import { useStore } from "@/lib/store"
import { ErrorBoundary } from "@/components/error-boundary"

// Dynamically import components with Radix UI to prevent hydration mismatch
const AppSidebar = dynamic(
  () => import("@/components/app-sidebar").then((mod) => ({ default: mod.AppSidebar })),
  {
    ssr: false,
    loading: () => (
      <aside className="hidden md:flex w-[200px] flex-col bg-sidebar border-r border-sidebar-border">
        <div className="flex items-center gap-2 px-4 h-16 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
          <div className="h-5 w-24 bg-muted animate-pulse rounded" />
        </div>
        <nav className="flex-1 px-3 py-4">
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-9 bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        </nav>
      </aside>
    ),
  }
)

const TopBar = dynamic(
  () => import("@/components/top-bar").then((mod) => ({ default: mod.TopBar })),
  {
    ssr: false,
    loading: () => <header className="h-16 border-b border-border bg-background" />,
  }
)

interface DashboardLayoutProps {
  children: React.ReactNode
}

/**
 * Dashboard Layout
 * 
 * Protected layout for authenticated dashboard pages.
 * Includes sidebar navigation, top bar with user menu, and error boundaries.
 * Wraps all dashboard content with SetupGuard to ensure proper onboarding.
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const initializeUserFromSupabase = useStore((state) => state.initializeUserFromSupabase)

  // Initialize user data from Supabase on mount
  useEffect(() => {
    initializeUserFromSupabase()
  }, [initializeUserFromSupabase])

  return (
    <SetupGuard>
      <div className="flex min-h-screen bg-background">
        <ErrorBoundary>
          <AppSidebar />
        </ErrorBoundary>
        <div className="flex flex-col flex-1">
          <TopBar />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
        </div>
      </div>
    </SetupGuard>
  )
}
