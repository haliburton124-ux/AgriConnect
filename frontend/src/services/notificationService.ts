import { api } from '@/lib/api'
import type { AppNotification } from '@/types'

export const notificationService = {
  list: (page = 1) =>
    api.get<{ data: AppNotification[]; unread_count: number; meta: { current_page: number; last_page: number; total: number } }>(
      '/notifications',
      { params: { page, per_page: 20 } },
    ),

  unreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),

  markAsRead: (id: string) =>
    api.post<{ message: string; data: AppNotification }>(`/notifications/${id}/read`),

  markAllAsRead: () => api.post<{ message: string }>('/notifications/read-all'),
}
