'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Bell, Check, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  link: string | null
  createdAt: string
}

interface NotificationCenterProps {
  staffId?: string
}

export function NotificationCenter({ staffId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (staffId) {
      fetchNotifications()
    }
  }, [staffId])

  const fetchNotifications = async () => {
    try {
      const url = staffId
        ? `/api/notifications?staffId=${staffId}`
        : '/api/notifications'
      const response = await fetch(url)
      const result = await response.json()
      if (result.success) {
        setNotifications(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
      })
      const result = await response.json()
      if (result.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        )
      }
    } catch (error) {
      console.error('Failed to mark as read:', error)
      toast.error('通知の既読化に失敗しました')
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (result.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
        toast.success('通知を削除しました')
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
      toast.error('通知の削除に失敗しました')
    }
  }

  const markAllAsRead = async () => {
    setIsLoading(true)
    try {
      await Promise.all(
        notifications.filter((n) => !n.isRead).map((n) => markAsRead(n.id))
      )
      toast.success('すべての通知を既読にしました')
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      toast.error('一括既読化に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'シフト確定':
        return 'bg-green-100 text-green-800'
      case 'シフト変更':
        return 'bg-yellow-100 text-yellow-800'
      case '希望提出依頼':
        return 'bg-blue-100 text-blue-800'
      case '承認依頼':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">通知</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                disabled={isLoading}
              >
                <Check className="h-4 w-4 mr-1" />
                すべて既読
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>通知はありません</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getNotificationTypeColor(
                        notification.type
                      )}`}
                    >
                      {notification.type}
                    </Badge>
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:text-red-700"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <h4 className="font-medium text-sm mb-1">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {notification.message}
                  </p>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: ja,
                      })}
                    </p>
                    {notification.link && (
                      <Button variant="link" size="sm" className="h-auto p-0">
                        詳細を見る
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-3 border-t text-center">
            <Button
              variant="link"
              size="sm"
              className="text-xs"
              onClick={fetchNotifications}
            >
              更新
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
