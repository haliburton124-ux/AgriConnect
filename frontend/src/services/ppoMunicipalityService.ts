import { api } from '@/lib/api'
import type { DashboardKpis, TrendPoint, CategoryBreakdownPoint, DashboardRecentIncident, MunicipalityComparisonRow } from './dashboardService'

export interface MunicipalityDetail {
  municipality: { id: number; name: string; type: string; latitude: number | null; longitude: number | null }
  kpis: DashboardKpis
  staff_counts: { farmers: number; technicians: number }
  category_breakdown: CategoryBreakdownPoint[]
  trends: TrendPoint[]
  recent_incidents: DashboardRecentIncident[]
  barangay_count: number
}

export const ppoMunicipalityService = {
  list: () => api.get<{ data: MunicipalityComparisonRow[] }>('/ppo/municipalities'),
  get: (id: number) => api.get<{ data: MunicipalityDetail }>(`/ppo/municipalities/${id}`),
}
