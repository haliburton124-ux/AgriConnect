import { api } from '@/lib/api'
import type { AppDocument } from '@/types'

export const municipalityDocumentService = {
  list: () => api.get<{ data: AppDocument[] }>('/municipality-documents'),

  upload: (formData: FormData, rolePrefix: 'mao' | 'ppo' | 'admin') =>
    api.post<{ message: string; data: AppDocument }>(`/${rolePrefix}/municipality-documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  remove: (id: number, rolePrefix: 'mao' | 'ppo' | 'admin') =>
    api.delete<{ message: string }>(`/${rolePrefix}/municipality-documents/${id}`),
}
