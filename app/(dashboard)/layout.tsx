"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { TopBar } from "@/components/top-bar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Prevent hydration mismatch by showing loading skeleton until mounted
  if (!isMounted) {
    return (
      <div className="flex min-h-screen bg-background">
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
        <div className="flex flex-col flex-1">
          <header className="h-16 border-b border-border bg-background" />
          <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex flex-col flex-1">
        <TopBar />
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
