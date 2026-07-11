import { api } from '@/lib/api'
import type { PaginatedResponse } from '@/types'

export interface Advisory {
  id: number
  title: string
  content: string
  type: 'weather' | 'pest' | 'disease' | 'market' | 'general'
  severity: 'info' | 'advisory' | 'warning' | 'emergency'
  valid_from: string | null
  valid_until: string | null
  issued_by?: { first_name: string; last_name: string; role: string }
  created_at: string
}

export const advisoryService = {
  /** Public endpoint — works for guests and authenticated users alike. */
  list: (type?: string) => api.get<PaginatedResponse<Advisory>>('/advisories', { params: type ? { type } : undefined }),
}
