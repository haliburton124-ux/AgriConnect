import { api } from '@/lib/api'

export interface AuditLogEntry {
  id: number
  action: string
  auditable_type: string | null
  auditable_id: number | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  ip_address: string | null
  user: { id: number; full_name: string; role: string } | null
  created_at: string
}

export interface AuditLogFilters {
  action?: string
  date_from?: string
  date_to?: string
}

export const auditLogService = {
  list: (filters?: AuditLogFilters) =>
    api.get<{ data: AuditLogEntry[]; meta: { current_page: number; last_page: number; total: number } }>('/admin/audit-logs', {
      params: filters,
    }),
}
