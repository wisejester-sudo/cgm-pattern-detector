import { Spinner } from "@/components/ui/spinner"

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-8 w-8 bg-muted animate-pulse rounded-lg" />
            </div>
            <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
            <div className="h-3 w-20 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="p-6 rounded-lg border border-border bg-card">
            <div className="h-6 w-32 bg-muted animate-pulse rounded mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      <div className="fixed bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border shadow-sm">
        <Spinner className="h-4 w-4" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    </div>
  )
}
