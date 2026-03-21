"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCircle, MessageSquare, RefreshCw, UserPlus, FileText, CheckSquare } from "lucide-react"
import { useStore } from "@/lib/store"
import { formatDistanceToNow, formatDateTime } from "@/lib/date-utils"
import Link from "next/link"

export function NotificationsSection() {
  const { notifications, unreadCount, loadNotificationsFromSupabase, markNotificationsAsRead, markAllNotificationsAsRead } = useStore()

  useEffect(() => {
    loadNotificationsFromSupabase()
  }, [loadNotificationsFromSupabase])

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead()
  }

  const handleNotificationClick = async (notification: typeof notifications[0]) => {
    if (!notification.is_read) {
      await markNotificationsAsRead([notification.id])
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'sms_received':
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case 'status_change':
        return <RefreshCw className="h-4 w-4 text-amber-500" />
      case 'note_added':
        return <FileText className="h-4 w-4 text-purple-500" />
      case 'tech_assigned':
        return <UserPlus className="h-4 w-4 text-green-500" />
      case 'job_created':
        return <Bell className="h-4 w-4 text-primary" />
      case 'job_completed':
        return <CheckSquare className="h-4 w-4 text-emerald-500" />
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'sms_received':
        return 'bg-blue-50 border-blue-200'
      case 'status_change':
        return 'bg-amber-50 border-amber-200'
      case 'note_added':
        return 'bg-purple-50 border-purple-200'
      case 'tech_assigned':
        return 'bg-green-50 border-green-200'
      case 'job_created':
        return 'bg-primary/10 border-primary/20'
      case 'job_completed':
        return 'bg-emerald-50 border-emerald-200'
      default:
        return 'bg-muted'
    }
  }

  const recentNotifications = notifications.slice(0, 10)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="h-5 px-2">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => loadNotificationsFromSupabase()}
            className="h-8 w-8"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentNotifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm">Notifications will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                  notification.is_read ? 'bg-muted/30' : getNotificationColor(notification.type)
                }`}
              >
                {notification.job_id ? (
                  <Link
                    href={`/jobs/${notification.job_id}`}
                    className="block"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <NotificationItem 
                      notification={notification} 
                      icon={getNotificationIcon(notification.type)}
                    />
                  </Link>
                ) : (
                  <NotificationItem 
                    notification={notification}
                    icon={getNotificationIcon(notification.type)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
        
        {notifications.length > 10 && (
          <div className="mt-4 text-center">
            <Link
              href="/notifications"
              className="text-sm text-primary hover:underline"
            >
              View all {notifications.length} notifications
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function NotificationItem({ 
  notification, 
  icon 
}: { 
  notification: { id: string; type: string; title: string; message: string; customer_name?: string | null; is_read: boolean; created_at: string; job_id?: string | null; job_number?: string | null }
  icon: React.ReactNode
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
            {notification.title}
          </p>
          {!notification.is_read && (
            <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
          )}
        </div>
        <p className={`text-sm ${notification.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>
          {notification.message}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {notification.customer_name && (
            <span className="text-xs text-muted-foreground">
              {notification.customer_name}
            </span>
          )}
          {notification.job_number && (
            <span className="text-xs text-muted-foreground">
              #{notification.job_number}
            </span>
          )}
          <span className="text-xs text-muted-foreground" title={formatDateTime(notification.created_at)}>
            {formatDistanceToNow(notification.created_at)}
          </span>
        </div>
      </div>
    </div>
  )
}
