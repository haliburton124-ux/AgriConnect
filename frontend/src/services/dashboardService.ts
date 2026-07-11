import { api } from '@/lib/api'
import type { UserRole, IncidentSeverity, IncidentStatus } from '@/types'

export interface DashboardKpis {
  total: number
  today: number
  pending: number
  validated: number
  assigned: number
  ongoing: number
  resolved: number
  rejected: number
  critical_open: number
  total_municipalities?: number
  total_farmers?: number
  total_technicians?: number
}

export interface TrendPoint {
  period: string
  total: number
}

export interface CategoryBreakdownPoint {
  category: string
  color: string
  total: number
}

export interface MunicipalityComparisonRow {
  id: number
  name: string
  total_incidents: number
  pending_incidents: number
  resolved_incidents: number
  critical_incidents: number
}

/** Loosely typed — this endpoint returns raw Eloquent attributes rather than an API Resource. */
export interface DashboardRecentIncident {
  id: number
  reference_code: string
  title: string
  severity: IncidentSeverity
  status: IncidentStatus
  incident_date: string
  category?: { name: string; color: string } | null
  farmer?: { full_name: string } | null
  municipality?: { name: string } | null
  barangay?: { name: string } | null
}

export interface DashboardData {
  kpis: DashboardKpis
  trends: TrendPoint[]
  category_breakdown: CategoryBreakdownPoint[]
  recent_incidents: DashboardRecentIncident[]
  municipality_comparison?: MunicipalityComparisonRow[]
}

function basePath(role: UserRole): string {
  switch (role) {
    case 'municipal_office':
      return '/mao'
    case 'provincial_office':
      return '/ppo'
    case 'admin':
      return '/admin'
    default:
      throw new Error(`No dashboard endpoint for role: ${role}`)
  }
}

export const dashboardService = {
  fetch: (role: UserRole, groupBy: 'day' | 'month' | 'year' = 'month') =>
    api.get<{ data: DashboardData }>(`${basePath(role)}/dashboard`, { params: { group_by: groupBy } }),
}
