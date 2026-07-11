import { api } from '@/lib/api'
import type { Farm } from '@/types'

export interface FarmPayload {
  farm_name: string
  municipality_id: number
  barangay_id: number
  address?: string
  latitude: number
  longitude: number
  area_hectares?: number
  farm_type: string
  primary_crop?: string
  ownership_status?: string
}

export const farmService = {
  list: () => api.get<{ data: Farm[] }>('/farmer/farms'),
  get: (id: number) => api.get<{ data: Farm }>(`/farmer/farms/${id}`),
  create: (payload: FarmPayload) => api.post<{ message: string; data: Farm }>('/farmer/farms', payload),
  update: (id: number, payload: Partial<FarmPayload>) => api.put<{ message: string; data: Farm }>(`/farmer/farms/${id}`, payload),
  remove: (id: number) => api.delete<{ message: string }>(`/farmer/farms/${id}`),
  saveBoundary: (id: number, geojson: GeoJSON.Polygon) =>
    api.post<{ message: string; data: Farm }>(`/farmer/farms/${id}/boundary`, geojson),
}
