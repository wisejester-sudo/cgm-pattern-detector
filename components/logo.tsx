"use client"

import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "white" | "icon-only"
}

const sizeMap = {
  sm: { icon: 24, text: "text-lg" },
  md: { icon: 32, text: "text-xl" },
  lg: { icon: 40, text: "text-2xl" },
  xl: { icon: 48, text: "text-3xl" },
}

export function Logo({ 
  className, 
  showText = true, 
  size = "md",
  variant = "default" 
}: LogoProps) {
  const { icon, text } = sizeMap[size]
  
  const iconColor = variant === "white" ? "#FFFFFF" : "#2563EB"
  const lightningColor = variant === "white" ? "#F97316" : "#F97316"
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Icon: Speech bubble with lightning bolt */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Speech bubble background */}
        <path
          d="M40 8H8C5.79086 8 4 9.79086 4 12V32C4 34.2091 5.79086 36 8 36H16L20 44L24 36H40C42.2091 36 44 34.2091 44 32V12C44 9.79086 42.2091 8 40 8Z"
          fill={iconColor}
        />
        {/* Lightning bolt cutout */}
        <path
          d="M26 14L18 24H24L22 32L30 22H24L26 14Z"
          fill={lightningColor}
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* House roof silhouette (subtle) */}
        <path
          d="M12 36L20 44L28 36"
          stroke={iconColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.3"
        />
      </svg>
      
      {/* Text */}
      {showText && (
        <span 
          className={cn(
            "font-bold tracking-tight",
            text,
            variant === "white" ? "text-white" : "text-foreground"
          )}
        >
          <span className={variant === "white" ? "text-white" : "text-primary"}>Dispatch</span>
          <span className={variant === "white" ? "text-orange-400" : "text-orange-500"}>ly</span>
        </span>
      )}
    </div>
  )
}

// Standalone icon component for favicon-like usage
export function LogoIcon({ 
  className, 
  size = 32,
  variant = "default" 
}: { 
  className?: string
  size?: number
  variant?: "default" | "white" 
}) {
  const iconColor = variant === "white" ? "#FFFFFF" : "#2563EB"
  const lightningColor = variant === "white" ? "#F97316" : "#F97316"
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M40 8H8C5.79086 8 4 9.79086 4 12V32C4 34.2091 5.79086 36 8 36H16L20 44L24 36H40C42.2091 36 44 34.2091 44 32V12C44 9.79086 42.2091 8 40 8Z"
        fill={iconColor}
      />
      <path
        d="M26 14L18 24H24L22 32L30 22H24L26 14Z"
        fill={lightningColor}
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
