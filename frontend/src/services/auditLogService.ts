import { api } from '@/lib/api'
import type { PaginatedResponse, UserRole } from '@/types'

export interface AuditLogEntry {
  id: number
  action: string
  module: string | null
  description: string | null
  auditable_type: string | null
  auditable_id: number | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  ip_address: string | null
  user_role: string | null
  user: { id: number; full_name: string; role: string } | null
  municipality: { id: number; name: string } | null
  created_at: string
}

export interface AuditLogFilters {
  search?: string
  action?: string
  module?: string
  user_role?: UserRole | ''
  user_id?: number
  municipality_id?: number
  date_from?: string
  date_to?: string
  page?: number
  per_page?: number
}

function cleanParams(filters: AuditLogFilters = {}) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  )
}

export const auditLogService = {
  filters: () =>
    api.get<{ data: { modules: string[]; roles: UserRole[] } }>('/admin/audit-logs/filters'),

  list: (filters?: AuditLogFilters) =>
    api.get<PaginatedResponse<AuditLogEntry>>('/admin/audit-logs', { params: cleanParams(filters) }),

  exportCsv: async (filters?: AuditLogFilters) => {
    const response = await api.get('/admin/audit-logs/export', {
      params: cleanParams(filters),
      responseType: 'blob',
    })

    const blob = new Blob([response.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    const stamp = new Date().toISOString().slice(0, 10)

    link.href = url
    link.download = `agriconnect-audit-logs-${stamp}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}
