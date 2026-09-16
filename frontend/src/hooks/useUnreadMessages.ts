import { useCallback, useEffect, useRef, useState } from 'react'
import { messageService } from '@/services/messageService'
import { useAuthStore } from '@/store/authStore'

const POLL_INTERVAL_MS = 15_000

export function notifyMessagesChanged() {
  window.dispatchEvent(new Event('agriri-messages-changed'))
}

export function useUnreadMessages() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [unreadCount, setUnreadCount] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
    intervalRef.current = setInterval(refresh, POLL_INTERVAL_MS)
    const onChanged = () => { refresh() }
    window.addEventListener('agriri-messages-changed', onChanged)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      window.removeEventListener('agriri-messages-changed', onChanged)
    }
  }, [isAuthenticated, refresh])

  return { unreadCount, refresh }
}
