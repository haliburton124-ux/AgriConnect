import { api } from '@/lib/api'
import type { Incident, PaginatedResponse } from '@/types'

export interface IncidentFilters {
  status?: string
  severity?: string
  category_id?: number
  search?: string
  date_from?: string
  date_to?: string
  page?: number
}

function toParams(filters: IncidentFilters = {}) {
  return Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''))
}

export const incidentService = {
  // Farmer
  listMine: (filters?: IncidentFilters) =>
    api.get<PaginatedResponse<Incident>>('/farmer/incidents', { params: toParams(filters) }),
  getMine: (id: number) => api.get<{ data: Incident }>(`/farmer/incidents/${id}`),

  // Technician
  listAssigned: (filters?: IncidentFilters) =>
    api.get<PaginatedResponse<Incident>>('/technician/incidents', { params: toParams(filters) }),
  getAssigned: (id: number) => api.get<{ data: Incident }>(`/technician/incidents/${id}`),
  updateStatus: (id: number, status: 'ongoing' | 'resolved', notes?: string) =>
    api.put<{ message: string; data: Incident }>(`/technician/incidents/${id}/status`, { status, notes }),
  submitRecommendation: (id: number, payload: FormData) =>
    api.post<{ message: string; data: Incident }>(`/technician/incidents/${id}/recommendations`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Municipal Agriculture Office
  listForMunicipality: (filters?: IncidentFilters) =>
    api.get<PaginatedResponse<Incident>>('/mao/incidents', { params: toParams(filters) }),
  getForMunicipality: (id: number) => api.get<{ data: Incident }>(`/mao/incidents/${id}`),
  validate: (id: number, remarks?: string) =>
    api.put<{ message: string; data: Incident }>(`/mao/incidents/${id}/validate`, { remarks }),
  reject: (id: number, rejection_reason: string) =>
    api.put<{ message: string; data: Incident }>(`/mao/incidents/${id}/reject`, { rejection_reason }),
  assign: (id: number, technician_id: number, notes?: string) =>
    api.post<{ message: string; data: Incident }>(`/mao/incidents/${id}/assign`, { technician_id, notes }),
  listTechnicians: () => api.get<{ data: { id: number; full_name: string; phone: string }[] }>('/mao/technicians'),
}
