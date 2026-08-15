import { Bell, CheckCheck, Heart, MessageCircle, Share2, AtSign } from 'lucide-react'
import { cn, formatDateTime } from '@/lib/utils'
import type { AppNotification } from '@/types'

const TYPE_ICONS: Record<string, typeof Bell> = {
  like: Heart,
  share: Share2,
  comment: MessageCircle,
  reply: MessageCircle,
  mention: AtSign,
}

interface NotificationPanelProps {
  open: boolean
  onClose: () => void
  notifications: AppNotification[]
  unreadCount: number
  loading: boolean
  onRefresh: () => void
  onMarkAsRead: (id: string) => Promise<void>
  onMarkAllAsRead: () => Promise<void>
  onOpenPost: (postId: number) => void
}

export function NotificationPanel({
  open,
  onClose,
  notifications,
  unreadCount,
  loading,
  onRefresh,
  onMarkAsRead,
  onMarkAllAsRead,
  onOpenPost,
}: NotificationPanelProps) {
  const handleOpen = async (notification: AppNotification) => {
    if (!notification.read_at) {
      await onMarkAsRead(notification.id)
    }
    if (notification.post_id) {
      onOpenPost(notification.post_id)
      onClose()
    }
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-glass sm:w-96">
        <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-ink">Notifications</p>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => onMarkAllAsRead()}
              className="inline-flex items-center gap-1 text-xs font-semibold text-forest hover:underline"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
        </div>

        <div className="max-h-[min(24rem,70vh)] overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <Bell className="h-6 w-6 text-forest-light" />
              <p className="text-xs text-muted-foreground">You&apos;re all caught up.</p>
            </div>
          ) : (
            <ul className="divide-y divide-black/5">
              {notifications.map((notification) => {
                const Icon = TYPE_ICONS[notification.type] ?? Bell
                return (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => handleOpen(notification)}
                      className={cn(
                        'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-forest/[0.04]',
                        !notification.read_at && 'bg-forest/[0.03]',
                      )}
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-ink">{notification.message}</span>
                        <span className="mt-1 block text-[11px] text-muted-foreground">
                          {formatDateTime(notification.created_at)}
                        </span>
                      </span>
                      {!notification.read_at && (
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gold" />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-black/5 px-4 py-2">
          <button
            type="button"
            onClick={onRefresh}
            className="w-full rounded-lg py-2 text-xs font-semibold text-forest hover:bg-forest/5"
          >
            Refresh
          </button>
        </div>
      </div>
    </>
  )
}

export function NotificationBell({
  unreadCount,
  open,
  onToggle,
  onOpenPost,
  tone = 'default',
  notifications,
  loading,
  onLoad,
  onMarkAsRead,
  onMarkAllAsRead,
}: {
  unreadCount: number
  open: boolean
  onToggle: () => void
  onOpenPost: (postId: number) => void
  tone?: 'default' | 'transparent'
  notifications: AppNotification[]
  loading: boolean
  onLoad: () => void
  onMarkAsRead: (id: string) => Promise<void>
  onMarkAllAsRead: () => Promise<void>
}) {
  const handleToggle = () => {
    if (!open) onLoad()
    onToggle()
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          'relative rounded-full p-2.5 transition-colors',
          tone === 'transparent'
            ? 'text-white hover:bg-white/10'
            : 'text-ink/70 hover:bg-forest/5',
        )}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      <NotificationPanel
        open={open}
        onClose={() => onToggle()}
        notifications={notifications}
        unreadCount={unreadCount}
        loading={loading}
        onRefresh={onLoad}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={onMarkAllAsRead}
        onOpenPost={onOpenPost}
      />
    </div>
  )
}
