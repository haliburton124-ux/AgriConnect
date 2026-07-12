import { api } from '@/lib/api'
import type { User } from '@/types'

export interface LoginPayload { email: string; password: string }
export interface RegisterPayload {
  first_name: string
  last_name: string
  middle_name?: string
  email: string
  phone: string
  password: string
  password_confirmation: string
  municipality_id: number
  barangay_id: number
}

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<{ message: string; token: string; user: User }>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    api.post<{ message: string; user: User; verification_code?: string; resumed?: boolean }>('/auth/register', payload),

  verifyOtp: (email: string, otp: string) =>
    api.post<{ message: string; token: string; user: User }>('/auth/verify-otp', { email, otp }),

  resendOtp: (email: string) =>
    api.post<{ message: string; verification_code?: string }>('/auth/resend-otp', { email }),

  forgotPassword: (email: string) => api.post<{ message: string }>('/auth/forgot-password', { email }),

  resetPassword: (payload: { email: string; token: string; password: string; password_confirmation: string }) =>
    api.post<{ message: string }>('/auth/reset-password', payload),

  me: () => api.get<{ user: User }>('/auth/me'),

  changePassword: (payload: { current_password: string; password: string; password_confirmation: string }) =>
    api.post<{ message: string }>('/auth/change-password', payload),

  logout: () => api.post<{ message: string }>('/auth/logout'),

  logoutAllDevices: () => api.post<{ message: string }>('/auth/logout-all'),
}
