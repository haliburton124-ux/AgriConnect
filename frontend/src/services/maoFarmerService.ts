import { api } from '@/lib/api'

export interface FarmerDirectoryEntry {
  id: number
  full_name: string
  email: string
  phone: string
  status: string
  barangay: { id: number; name: string } | null
  farm_count: number
  incident_count: number
  created_at: string
}

export interface FarmerDirectoryFilters {
  barangay_id?: number
  search?: string
  page?: number
}

export const maoFarmerService = {
  list: (filters?: FarmerDirectoryFilters) =>
    api.get<{ data: FarmerDirectoryEntry[]; meta: { current_page: number; last_page: number; total: number } }>('/mao/farmers', {
      params: filters,
    }),
  get: (id: number) => api.get('/mao/farmers/' + id),
}
