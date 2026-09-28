import { api } from '@/lib/api'
import type { Incident, PaginatedResponse } from '@/types'

export type TechnicianAvailability = 'available' | 'busy' | 'on_leave'

export interface MaoTechnician {
  id: number
  first_name?: string
  last_name?: string
  full_name: string
  email?: string
  phone: string
  avatar_url?: string | null
  municipality?: { id: number; name: string } | null
  barangay?: { id: number; name: string } | null
  specializations?: string[]
  years_experience?: number
  license_number?: string | null
  availability?: TechnicianAvailability
  assigned_cases?: number
  workload?: number
}

export interface IncidentFilters {
  status?: string
  severity?: string
  category_id?: number
  search?: string
  date_from?: string
  date_to?: string
  page?: number
  per_page?: number
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
    api.post<{ message: string; data: Incident }>(`/technician/incidents/${id}/recommendations`, payload),

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
  listTechnicians: () => api.get<{ data: MaoTechnician[] }>('/mao/technicians'),
  createTechnician: (payload: {
    first_name: string
    last_name: string
    email: string
    phone: string
    password: string
    barangay_id: number
    license_number?: string
    specializations?: string[]
  }) => api.post<{ message: string; data: MaoTechnician }>('/mao/technicians', payload),
}
