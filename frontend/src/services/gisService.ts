import { api } from '@/lib/api'
import type { UserRole, IncidentStatus, IncidentSeverity } from '@/types'

export interface GisFilters {
  status?: string
  severity?: string
  category_id?: number
  barangay_id?: number
  municipality_id?: number
  date_from?: string
  date_to?: string
}

export interface MapPoint {
  id: number
  reference_code: string
  title: string
  status: IncidentStatus
  severity: IncidentSeverity
  latitude: number
  longitude: number
  category: { name: string; icon: string; color: string } | null
  created_at: string
}

export type HeatPoint = [number, number, number]

function basePath(role: UserRole): string {
  switch (role) {
    case 'municipal_office':
      return '/mao'
    case 'provincial_office':
      return '/ppo'
    case 'admin':
      return '/admin'
    case 'technician':
      return '/technician'
    default:
      throw new Error(`GIS is not available for role: ${role}`)
  }
}

function toParams(filters: GisFilters = {}) {
  return Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''))
}

export const gisService = {
  mapPoints: (role: UserRole, filters?: GisFilters) =>
    api.get<{ data: MapPoint[] }>(`${basePath(role)}/gis/map-points`, { params: toParams(filters) }),
  heatmap: (role: UserRole, filters?: GisFilters) =>
    api.get<{ data: HeatPoint[] }>(`${basePath(role)}/gis/heatmap`, { params: toParams(filters) }),
}
