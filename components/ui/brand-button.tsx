"use client"

import * as React from "react"
import { Button } from "./button"
import { useBrandColor } from "@/lib/hooks/use-branding"
import { cn } from "@/lib/utils"

interface BrandButtonProps extends React.ComponentProps<'button'> {
  applyBrandColor?: boolean
}

/**
 * Button that uses the company's brand color
 * Falls back to default primary color if no brand color set
 */
export function BrandButton({
  className,
  style,
  applyBrandColor = true,
  ...props
}: BrandButtonProps) {
  const brandColor = useBrandColor()

  if (!applyBrandColor) {
    return <Button className={className} style={style} {...props} />
  }

  return (
    <Button
      className={cn("border-0", className)}
      style={{
        ...style,
        backgroundColor: brandColor,
        color: "#ffffff",
      }}
      {...props}
    />
  )
}
