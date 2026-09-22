import { useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

export const REALTIME_EVENT = 'agriri-realtime'

export interface RealtimeInboxPayload {
  unread_messages: number
  unread_notifications: number
  latest_message_id: number
  sender_id: number | null
}

export function notifyMessagesChanged() {
  window.dispatchEvent(new Event('agriri-messages-changed'))
}

function dispatchRealtime(payload: RealtimeInboxPayload) {
  window.dispatchEvent(new CustomEvent<RealtimeInboxPayload>(REALTIME_EVENT, { detail: payload }))
}

function fingerprint(payload: RealtimeInboxPayload): string {
  return [
    payload.unread_messages,
    payload.unread_notifications,
    payload.latest_message_id,
    payload.sender_id ?? '',
  ].join(':')
}

/**
 * Live inbox updates without a page refresh.
 * Uses a short snapshot poll (artisan serve is single-threaded, so a
 * held-open socket would block the whole API).
 */
export function useRealtimeInbox() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const lastFingerprint = useRef<string>('')

  useEffect(() => {
    if (!isAuthenticated) {
      lastFingerprint.current = ''
      return
    }

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const pull = async () => {
      try {
        const { data } = await api.get<RealtimeInboxPayload>('/realtime/snapshot', { skipLoader: true })
        if (cancelled) return
        const next = fingerprint(data)
        if (next !== lastFingerprint.current) {
          lastFingerprint.current = next
          dispatchRealtime(data)
        }
      } catch {
        // stay on the last known snapshot
      }
    }

    const schedule = () => {
      if (cancelled) return
      const delay = document.hidden ? 4000 : 1000
      timer = setTimeout(async () => {
        await pull()
        schedule()
      }, delay)
    }

    pull().then(schedule)
    const onVisible = () => {
      if (!document.hidden) pull()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [isAuthenticated])
}
