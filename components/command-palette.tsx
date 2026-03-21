"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useStore } from "@/lib/store"
import {
  Briefcase,
  Users,
  Settings,
  Plus,
  Home,
  BarChart3,
  Phone,
  Calendar,
  CheckCircle,
  Truck,
  Wrench,
  Search,
  Loader2,
} from "lucide-react"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const router = useRouter()
  const { jobs, technicians } = useStore()

  // Keyboard shortcut: ⌘K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  // Filter jobs based on search
  const filteredJobs = search
    ? jobs
        .filter(
          (job) =>
            job.customer_name.toLowerCase().includes(search.toLowerCase()) ||
            job.customer_phone.includes(search) ||
            job.job_type.toLowerCase().includes(search.toLowerCase())
        )
        .slice(0, 5)
    : []

  // Filter technicians
  const filteredTechs = search
    ? technicians
        .filter(
          (tech) =>
            tech.name.toLowerCase().includes(search.toLowerCase()) ||
            tech.phone.includes(search)
        )
        .slice(0, 3)
    : []

  const navigationCommands = [
    {
      name: "Dashboard",
      icon: Home,
      shortcut: "⌘D",
      action: () => router.push("/dashboard"),
    },
    {
      name: "Jobs",
      icon: Briefcase,
      shortcut: "⌘J",
      action: () => router.push("/jobs"),
    },
    {
      name: "Technicians",
      icon: Users,
      shortcut: "⌘T",
      action: () => router.push("/technicians"),
    },
    {
      name: "Reports",
      icon: BarChart3,
      action: () => router.push("/reports"),
    },
    {
      name: "Settings",
      icon: Settings,
      action: () => router.push("/settings"),
    },
  ]

  const quickActions = [
    {
      name: "Create New Job",
      icon: Plus,
      shortcut: "⌘⇧J",
      action: () => {
        // This would trigger the create job modal
        router.push("/jobs")
        // Dispatch custom event to open modal
        window.dispatchEvent(new CustomEvent("openCreateJob"))
      },
    },
    {
      name: "Add Technician",
      icon: Users,
      action: () => router.push("/technicians"),
    },
  ]

  const statusFilters = [
    {
      name: "Scheduled Jobs",
      icon: Calendar,
      action: () => router.push("/jobs?status=scheduled"),
    },
    {
      name: "In Progress",
      icon: Truck,
      action: () => router.push("/jobs?status=en_route"),
    },
    {
      name: "Working",
      icon: Wrench,
      action: () => router.push("/jobs?status=working"),
    },
    {
      name: "Completed Today",
      icon: CheckCircle,
      action: () => router.push("/jobs?status=complete"),
    },
  ]

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search jobs, technicians, or navigate..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>
          <div className="py-6 text-center">
            <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No results found for "{search}"
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try searching for a customer name, phone, or job type
            </p>
          </div>
        </CommandEmpty>

        {/* Recent searches or suggestions when empty */}
        {!search && (
          <>
            <CommandGroup heading="Quick Actions">
              {quickActions.map((action) => (
                <CommandItem
                  key={action.name}
                  onSelect={() => runCommand(action.action)}
                  className="cursor-pointer"
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  <span>{action.name}</span>
                  {action.shortcut && (
                    <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                      {action.shortcut}
                    </kbd>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Navigation">
              {navigationCommands.map((command) => (
                <CommandItem
                  key={command.name}
                  onSelect={() => runCommand(command.action)}
                  className="cursor-pointer"
                >
                  <command.icon className="mr-2 h-4 w-4" />
                  <span>{command.name}</span>
                  {command.shortcut && (
                    <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                      {command.shortcut}
                    </kbd>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Filter by Status">
              {statusFilters.map((filter) => (
                <CommandItem
                  key={filter.name}
                  onSelect={() => runCommand(filter.action)}
                  className="cursor-pointer"
                >
                  <filter.icon className="mr-2 h-4 w-4" />
                  <span>{filter.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Search results */}
        {search && filteredJobs.length > 0 && (
          <CommandGroup heading={`Jobs (${filteredJobs.length})`}>
            {filteredJobs.map((job) => (
              <CommandItem
                key={job.id}
                onSelect={() => runCommand(() => router.push(`/jobs/${job.id}`))}
                className="cursor-pointer"
              >
                <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span>{job.customer_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {job.job_type} • {job.status}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {search && filteredTechs.length > 0 && (
          <CommandGroup heading={`Technicians (${filteredTechs.length})`}>
            {filteredTechs.map((tech) => (
              <CommandItem
                key={tech.id}
                onSelect={() => runCommand(() => router.push(`/technicians`))}
                className="cursor-pointer"
              >
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span>{tech.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {tech.phone}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>

      <div className="border-t px-3 py-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="rounded border px-1 font-mono">↑↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border px-1 font-mono">↵</kbd>
              <span>Select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border px-1 font-mono">esc</kbd>
              <span>Close</span>
            </span>
          </div>
          <span>Press ⌘K to open</span>
        </div>
      </div>
    </CommandDialog>
  )
}
