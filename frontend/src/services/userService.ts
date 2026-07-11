import { api } from '@/lib/api'
import type { PaginatedResponse, User, UserRole } from '@/types'

export interface UserFilters {
  role?: UserRole
  municipality_id?: number
  status?: string
  search?: string
  page?: number
}

export interface CreateStaffUserPayload {
  first_name: string
  last_name: string
  email: string
  phone: string
  password: string
  role: Exclude<UserRole, 'farmer'>
  municipality_id?: number
  license_number?: string
}

function toParams(filters: UserFilters = {}) {
  return Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''))
}

export const userService = {
  list: (filters?: UserFilters) => api.get<PaginatedResponse<User>>('/admin/users', { params: toParams(filters) }),
  create: (payload: CreateStaffUserPayload) => api.post<{ message: string; data: User }>('/admin/users', payload),
  updateStatus: (id: number, status: 'active' | 'inactive' | 'suspended') =>
    api.put<{ message: string; data: User }>(`/admin/users/${id}/status`, { status }),
  remove: (id: number) => api.delete<{ message: string }>(`/admin/users/${id}`),
}
