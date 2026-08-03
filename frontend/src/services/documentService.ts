import { api } from '@/lib/api'
import type { AppDocument } from '@/types'

export const documentService = {
  list: (archived = false) =>
    api.get<{ data: AppDocument[] }>('/documents', { params: archived ? { archived: 1 } : undefined }),
  upload: (formData: FormData) =>
    api.post<{ message: string; data: AppDocument }>('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  archive: (id: number) => api.post<{ message: string }>(`/documents/${id}/archive`),
  restore: (id: number) => api.post<{ message: string }>(`/documents/${id}/restore`),
}
