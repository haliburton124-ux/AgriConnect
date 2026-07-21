import { useCallback, useEffect, useRef, useState } from 'react'
import { notificationService } from '@/services/notificationService'
import { useAuthStore } from '@/store/authStore'
import type { AppNotification } from '@/types'

const POLL_INTERVAL_MS = 30_000

export function useNotifications() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    try {
      const { data } = await notificationService.list()
      setNotifications(data.data)
      setUnreadCount(data.unread_count)
    } catch {
      // keep last known state on transient failures
    }
  }, [isAuthenticated])

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0)
      return
    }

    try {
      const { data } = await notificationService.unreadCount()
      setUnreadCount(data.count)
    } catch {
      // ignore
    }
  }, [isAuthenticated])

  const load = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      await refresh()
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, refresh])

  const markAsRead = useCallback(async (id: string) => {
    const { data } = await notificationService.markAsRead(id)
    setNotifications((current) => current.map((n) => (n.id === id ? data.data : n)))
    setUnreadCount((count) => Math.max(0, count - 1))
  }, [])

  const markAllAsRead = useCallback(async () => {
    await notificationService.markAllAsRead()
    setNotifications((current) => current.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })))
    setUnreadCount(0)
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    refreshUnreadCount()

    intervalRef.current = setInterval(refreshUnreadCount, POLL_INTERVAL_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isAuthenticated, refreshUnreadCount])

  return {
    notifications,
    unreadCount,
    loading,
    load,
    refresh,
    markAsRead,
    markAllAsRead,
  }
}
