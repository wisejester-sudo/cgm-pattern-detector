"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"
import { SetupGuard } from "@/components/setup-guard"
import { useStore } from "@/lib/store"

// Dynamically import components with Radix UI to prevent hydration mismatch
const AppSidebar = dynamic(() => import("@/components/app-sidebar").then(mod => ({ default: mod.AppSidebar })), {
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
})

const TopBar = dynamic(() => import("@/components/top-bar").then(mod => ({ default: mod.TopBar })), {
  ssr: false,
  loading: () => <header className="h-16 border-b border-border bg-background" />,
})

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const initializeUserFromSupabase = useStore(state => state.initializeUserFromSupabase)
  
  // Initialize user data from Supabase on mount
  useEffect(() => {
    initializeUserFromSupabase()
  }, [initializeUserFromSupabase])

  return (
    <SetupGuard>
      <div className="flex min-h-screen bg-background relative">
        {/* Subtle Field Service Collage Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Tool icons pattern */}
          <div className="absolute top-10 left-[20%] w-32 h-32 opacity-[0.03] rotate-12">
            <svg viewBox="0 0 100 100" fill="currentColor" className="text-foreground">
              <path d="M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z" />
            </svg>
          </div>
          <div className="absolute top-[30%] right-[10%] w-24 h-24 opacity-[0.02] -rotate-6">
            <svg viewBox="0 0 100 100" fill="currentColor" className="text-foreground">
              <circle cx="50" cy="50" r="40" />
              <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="8" />
            </svg>
          </div>
          <div className="absolute bottom-[20%] left-[15%] w-40 h-40 opacity-[0.025] rotate-45">
            <svg viewBox="0 0 100 100" fill="currentColor" className="text-foreground">
              <rect x="20" y="20" width="60" height="60" rx="5" />
              <rect x="35" y="35" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="4" />
            </svg>
          </div>
          <div className="absolute top-[50%] left-[5%] w-28 h-28 opacity-[0.02] -rotate-12">
            <svg viewBox="0 0 100 100" fill="currentColor" className="text-foreground">
              <polygon points="50,10 90,90 10,90" />
            </svg>
          </div>
          <div className="absolute bottom-[40%] right-[20%] w-36 h-36 opacity-[0.03] rotate-6">
            <svg viewBox="0 0 100 100" fill="currentColor" className="text-foreground">
              <path d="M20 50 L50 20 L80 50 L50 80 Z" />
            </svg>
          </div>
          <div className="absolute top-[15%] right-[30%] w-20 h-20 opacity-[0.025] -rotate-45">
            <svg viewBox="0 0 100 100" fill="currentColor" className="text-foreground">
              <path d="M50 10 L90 50 L50 90 L10 50 Z" />
            </svg>
          </div>
          <div className="absolute bottom-[10%] right-[40%] w-32 h-32 opacity-[0.02] rotate-24">
            <svg viewBox="0 0 100 100" fill="currentColor" className="text-foreground">
              <circle cx="30" cy="30" r="20" />
              <circle cx="70" cy="30" r="20" />
              <circle cx="50" cy="70" r="20" />
            </svg>
          </div>
          <div className="absolute top-[60%] right-[5%] w-24 h-24 opacity-[0.03] -rotate-18">
            <svg viewBox="0 0 100 100" fill="currentColor" className="text-foreground">
              <rect x="10" y="30" width="80" height="40" rx="5" />
              <rect x="30" y="10" width="40" height="20" rx="3" />
            </svg>
          </div>
          <div className="absolute top-[75%] left-[25%] w-28 h-28 opacity-[0.02] rotate-8">
            <svg viewBox="0 0 100 100" fill="currentColor" className="text-foreground">
              <path d="M10 50 Q50 10 90 50 Q50 90 10 50" />
            </svg>
          </div>
          <div className="absolute top-[35%] left-[40%] w-16 h-16 opacity-[0.025] -rotate-30">
            <svg viewBox="0 0 100 100" fill="currentColor" className="text-foreground">
              <path d="M50 10 L90 40 L75 90 L25 90 L10 40 Z" />
            </svg>
          </div>
          {/* Gradient overlays for subtle fade */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-transparent to-background opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background opacity-60" />
        </div>
        <AppSidebar />
        <div className="flex flex-col flex-1 relative z-10">
          <TopBar />
          <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SetupGuard>
  )
}
