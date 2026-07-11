import { api } from '@/lib/api'
import type { Appointment, PaginatedResponse } from '@/types'

export interface AppointmentPayload {
  incident_id?: number
  farm_id?: number
  technician_id?: number
  farmer_id?: number
  scheduled_at: string
  purpose?: string
  notes?: string
}

export const appointmentService = {
  list: (status?: string) => api.get<PaginatedResponse<Appointment>>('/appointments', { params: { status } }),
  create: (payload: AppointmentPayload) => api.post<{ message: string; data: Appointment }>('/appointments', payload),
  updateStatus: (id: number, status: Appointment['status']) =>
    api.put<{ message: string; data: Appointment }>(`/appointments/${id}/status`, { status }),
}
