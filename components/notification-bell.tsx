"use client"

import { useState, useEffect, useRef } from "react"
import { Bell } from "lucide-react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "@/lib/date-utils"
import Link from "next/link"

export function NotificationBell() {
  const { notifications, unreadCount, loadNotificationsFromSupabase, markNotificationsAsRead, markAllNotificationsAsRead } = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load notifications on mount
  useEffect(() => {
    loadNotificationsFromSupabase()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotificationsFromSupabase, 30000)
    return () => clearInterval(interval)
  }, [loadNotificationsFromSupabase])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleNotificationClick = async (notification: typeof notifications[0]) => {
    if (!notification.is_read) {
      await markNotificationsAsRead([notification.id])
    }
    setIsOpen(false)
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'sms_received':
        return '💬'
      case 'status_change':
        return '🔄'
      case 'note_added':
        return '📝'
      case 'tech_assigned':
        return '👤'
      case 'job_created':
        return '📋'
      case 'job_completed':
        return '✅'
      default:
        return '🔔'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-popover border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b bg-muted/50">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-xs h-auto py-1"
              >
                Mark all read
              </Button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                      !notification.is_read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {notification.job_id ? (
                      <Link
                        href={`/jobs/${notification.job_id}`}
                        className="block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <NotificationItem notification={notification} />
                      </Link>
                    ) : (
                      <NotificationItem notification={notification} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-2 border-t bg-muted/50 text-center">
            <Link
              href="/notifications"
              className="text-sm text-primary hover:underline"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function NotificationItem({ notification }: { notification: { id: string; type: string; title: string; message: string; customer_name?: string | null; is_read: boolean; created_at: string; job_id?: string | null } }) {
  return (
    <div className="flex gap-3">
      <span className="text-xl shrink-0">{getNotificationIcon(notification.type)}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium truncate ${!notification.is_read ? 'text-primary' : ''}`}>
            {notification.title}
          </p>
          {!notification.is_read && (
            <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
        {notification.customer_name && (
          <p className="text-xs text-muted-foreground mt-1">
            {notification.customer_name}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(notification.created_at)}
        </p>
      </div>
    </div>
  )
}
