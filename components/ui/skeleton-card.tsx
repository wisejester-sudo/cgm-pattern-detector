"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SkeletonCardProps {
  className?: string
  header?: boolean
  lines?: number
}

export function SkeletonCard({ className, header = true, lines = 3 }: SkeletonCardProps) {
  return (
    <Card className={cn("animate-pulse", className)}>
      {header && (
        <CardHeader className="pb-2">
          <div className="h-4 w-24 bg-muted rounded" />
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-3 bg-muted rounded",
                i === 0 ? "w-3/4" : i === 1 ? "w-1/2" : "w-2/3"
              )}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function SkeletonStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="h-4 w-24 bg-muted rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted rounded mb-2" />
            <div className="h-3 w-20 bg-muted rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-lg border animate-pulse"
        >
          <div className="w-10 h-10 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-3 w-1/2 bg-muted rounded" />
          </div>
          <div className="w-20 h-8 bg-muted rounded" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-1 h-4 bg-muted rounded" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b animate-pulse">
          {Array.from({ length: 4 }).map((_, j) => (
            <div
              key={j}
              className={cn(
                "flex-1 h-4 bg-muted rounded",
                j === 0 ? "w-1/4" : j === 1 ? "w-1/3" : "w-1/4"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
