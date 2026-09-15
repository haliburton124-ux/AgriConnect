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

export interface AppointmentTechnician {
  id: number
  full_name: string
  phone?: string
  assigned?: boolean
}

export const appointmentService = {
  list: (status?: string) => api.get<PaginatedResponse<Appointment>>('/appointments', { params: { status } }),
  listTechnicians: () => api.get<{ data: AppointmentTechnician[] }>('/farmer/technicians'),
  create: (payload: AppointmentPayload) => api.post<{ message: string; data: Appointment }>('/appointments', payload),
  updateStatus: (id: number, status: Appointment['status']) =>
    api.put<{ message: string; data: Appointment }>(`/appointments/${id}/status`, { status }),
}
