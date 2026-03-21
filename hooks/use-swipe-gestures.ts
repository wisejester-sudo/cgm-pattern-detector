"use client"

import { useState, useCallback, useRef } from "react"

interface SwipeConfig {
  threshold?: number
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

export function useSwipeGestures({
  threshold = 50,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
}: SwipeConfig) {
  const [isSwiping, setIsSwiping] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const touchEnd = useRef<{ x: number; y: number } | null>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    }
    setIsSwiping(true)
    setSwipeDirection(null)
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    }

    // Calculate direction for visual feedback
    if (touchStart.current && touchEnd.current) {
      const diffX = touchStart.current.x - touchEnd.current.x
      const diffY = touchStart.current.y - touchEnd.current.y

      if (Math.abs(diffX) > Math.abs(diffY)) {
        setSwipeDirection(diffX > 0 ? "left" : "right")
      } else {
        setSwipeDirection(diffY > 0 ? "up" : "down")
      }
    }
  }, [])

  const onTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return

    const diffX = touchStart.current.x - touchEnd.current.x
    const diffY = touchStart.current.y - touchEnd.current.y
    const absX = Math.abs(diffX)
    const absY = Math.abs(diffY)

    // Horizontal swipe
    if (absX > absY && absX > threshold) {
      if (diffX > 0) {
        onSwipeLeft?.()
      } else {
        onSwipeRight?.()
      }
    }

    // Vertical swipe
    if (absY > absX && absY > threshold) {
      if (diffY > 0) {
        onSwipeUp?.()
      } else {
        onSwipeDown?.()
      }
    }

    setIsSwiping(false)
    setSwipeDirection(null)
    touchStart.current = null
    touchEnd.current = null
  }, [threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

  return {
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
    isSwiping,
    swipeDirection,
  }
}

// Hook for pull-to-refresh
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const touchStartY = useRef<number | null>(null)
  const REFRESH_THRESHOLD = 100

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    // Only enable pull-to-refresh at top of page
    if (window.scrollY === 0) {
      touchStartY.current = e.targetTouches[0].clientY
      setIsPulling(true)
    }
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return

    const touchY = e.targetTouches[0].clientY
    const diff = touchY - touchStartY.current

    if (diff > 0) {
      // Only pull down, not up
      setPullDistance(Math.min(diff * 0.5, 150)) // Dampen the pull
    }
  }, [])

  const onTouchEnd = useCallback(async () => {
    if (pullDistance > REFRESH_THRESHOLD) {
      await onRefresh()
    }

    setIsPulling(false)
    setPullDistance(0)
    touchStartY.current = null
  }, [pullDistance, onRefresh])

  return {
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
    isPulling,
    pullDistance,
    refreshThreshold: REFRESH_THRESHOLD,
  }
}
