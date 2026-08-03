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
  list: (params?: { archived?: boolean }) =>
    api.get<PaginatedResponse<Announcement>>('/announcements', {
      params: params?.archived ? { archived: 1 } : undefined,
    }),

  create: (role: UserRole, formData: FormData) =>
    api.post<{ message: string; data: Announcement }>(`${basePath(role)}/announcements`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  archive: (role: UserRole, id: number) =>
    api.post<{ message: string }>(`${basePath(role)}/announcements/${id}/archive`),
  restore: (role: UserRole, id: number) =>
    api.post<{ message: string }>(`${basePath(role)}/announcements/${id}/restore`),
}
