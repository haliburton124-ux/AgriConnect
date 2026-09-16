import { useCallback, useEffect, useState } from 'react'
import { notificationService } from '@/services/notificationService'
import { useAuthStore } from '@/store/authStore'
import { REALTIME_EVENT, type RealtimeInboxPayload } from '@/hooks/useRealtimeInbox'
import type { AppNotification } from '@/types'

export function useNotifications() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

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

    const onRealtime = (event: Event) => {
      const payload = (event as CustomEvent<RealtimeInboxPayload>).detail
      if (typeof payload?.unread_notifications !== 'number') return
      setUnreadCount(payload.unread_notifications)
      void refresh()
    }
    const onChanged = () => { refreshUnreadCount() }

    window.addEventListener(REALTIME_EVENT, onRealtime)
    window.addEventListener('agriri-messages-changed', onChanged)
    return () => {
      window.removeEventListener(REALTIME_EVENT, onRealtime)
      window.removeEventListener('agriri-messages-changed', onChanged)
    }
  }, [isAuthenticated, refresh, refreshUnreadCount])

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
