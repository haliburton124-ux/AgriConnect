import { api } from '@/lib/api'
import type { Program, ProgramApplication, PaginatedResponse } from '@/types'

export const programService = {
  list: (category?: string) => api.get<PaginatedResponse<Program>>('/programs', { params: { category } }),
  get: (id: number) => api.get<{ data: Program }>(`/programs/${id}`),
  myApplications: () => api.get<PaginatedResponse<ProgramApplication>>('/farmer/program-applications'),
  apply: (programId: number, formData: FormData) =>
    api.post<{ message: string; data: ProgramApplication }>(`/farmer/programs/${programId}/apply`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}
