"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FabAction {
  icon: React.ReactNode
  label: string
  onClick: () => void
  color?: string
}

interface FloatingActionButtonProps {
  actions: FabAction[]
  mainIcon: React.ReactNode
  mainLabel?: string
  className?: string
}

export function FloatingActionButton({
  actions,
  mainIcon,
  mainLabel = "Actions",
  className,
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      {/* Action Buttons */}
      <div className={cn(
        "absolute bottom-full right-0 mb-4 space-y-3 transition-all duration-300",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        {actions.map((action, index) => (
          <div
            key={index}
            className="flex items-center justify-end gap-3"
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
              opacity: isOpen ? 1 : 0,
              transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
              transition: 'all 0.3s ease-out'
            }}
          >
            <span className="bg-popover text-popover-foreground px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg">
              {action.label}
            </span>
            <Button
              size="icon"
              className={cn(
                "h-14 w-14 rounded-full shadow-lg",
                action.color || "bg-primary text-primary-foreground"
              )}
              onClick={() => {
                action.onClick()
                setIsOpen(false)
              }}
            >
              {action.icon}
            </Button>
          </div>
        ))}
      </div>

      {/* Main FAB Button */}
      <Button
        size="icon"
        className={cn(
          "h-16 w-16 rounded-full shadow-2xl transition-all duration-300",
          isOpen ? "bg-destructive" : "bg-primary"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          className="transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
        >
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          ) : (
            mainIcon
          )}
        </div>
      </Button>
    </div>
  )
}
