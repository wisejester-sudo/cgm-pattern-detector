"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
      <AnimatePresence>
        {isOpen && (
          <div className="absolute bottom-full right-0 mb-4 space-y-3">
            {actions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-end gap-3"
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
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        className={cn(
          "h-16 w-16 rounded-full shadow-2xl transition-all duration-300",
          isOpen ? "bg-destructive rotate-45" : "bg-primary"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
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
        </motion.div>
      </Button>
    </div>
  )
}
