import { api } from '@/lib/api'
import type { Announcement, PaginatedResponse, UserRole } from '@/types'

function basePath(role: UserRole): string {
  switch (role) {
    case 'municipal_office':
      return '/mao'
    case 'provincial_office':
      return '/ppo'
    case 'admin':
      return '/admin'
    default:
      throw new Error(`Only office roles can post announcements (got: ${role})`)
  }
}

export const announcementService = {
  list: () => api.get<PaginatedResponse<Announcement>>('/announcements'),

  create: (role: UserRole, formData: FormData) =>
    api.post<{ message: string; data: Announcement }>(`${basePath(role)}/announcements`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  remove: (role: UserRole, id: number) => api.delete<{ message: string }>(`${basePath(role)}/announcements/${id}`),
}
