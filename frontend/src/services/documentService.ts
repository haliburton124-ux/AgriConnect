import { api } from '@/lib/api'
import type { AppDocument } from '@/types'

export const documentService = {
  list: () => api.get<{ data: AppDocument[] }>('/documents'),
  upload: (formData: FormData) =>
    api.post<{ message: string; data: AppDocument }>('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  remove: (id: number) => api.delete<{ message: string }>(`/documents/${id}`),
}
