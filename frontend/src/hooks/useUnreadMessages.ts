import { useCallback, useEffect, useState } from 'react'
import { messageService } from '@/services/messageService'
import { useAuthStore } from '@/store/authStore'
import { REALTIME_EVENT, notifyMessagesChanged, type RealtimeInboxPayload } from '@/hooks/useRealtimeInbox'

export { notifyMessagesChanged }

export function useUnreadMessages() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [unreadCount, setUnreadCount] = useState(0)

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0)
      return
    }
    try {
      const { data } = await messageService.unreadCount()
      setUnreadCount(data.count)
    } catch {
      // keep last known count
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0)
      return
    }

    refresh()
    const onRealtime = (event: Event) => {
      const payload = (event as CustomEvent<RealtimeInboxPayload>).detail
      if (typeof payload?.unread_messages === 'number') {
        setUnreadCount(payload.unread_messages)
      }
    }
    const onChanged = () => { refresh() }
    window.addEventListener(REALTIME_EVENT, onRealtime)
    window.addEventListener('agriri-messages-changed', onChanged)
    return () => {
      window.removeEventListener(REALTIME_EVENT, onRealtime)
      window.removeEventListener('agriri-messages-changed', onChanged)
    }
  }, [isAuthenticated, refresh])

  return { unreadCount, refresh }
}
