import { api } from '@/lib/api'
import type { AppDocument } from '@/types'

export const municipalityDocumentService = {
  list: (archived = false) =>
    api.get<{ data: AppDocument[] }>('/municipality-documents', {
      params: archived ? { archived: 1 } : undefined,
    }),

  upload: (formData: FormData, rolePrefix: 'mao' | 'ppo' | 'admin') =>
    api.post<{ message: string; data: AppDocument }>(`/${rolePrefix}/municipality-documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  archive: (id: number, rolePrefix: 'mao' | 'ppo' | 'admin') =>
    api.post<{ message: string }>(`/${rolePrefix}/municipality-documents/${id}/archive`),
  restore: (id: number, rolePrefix: 'mao' | 'ppo' | 'admin') =>
    api.post<{ message: string }>(`/${rolePrefix}/municipality-documents/${id}/restore`),
}
