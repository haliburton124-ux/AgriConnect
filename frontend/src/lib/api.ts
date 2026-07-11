import axios from 'axios'

/**
 * Central Axios instance. The Sanctum bearer token is attached on every
 * request; a 401 response clears the session and bounces to /login.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('agriri_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('agriri_token')
      localStorage.removeItem('agriri_user')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

/** Shape of Laravel's standard validation error response (422). */
export interface ApiValidationError {
  message: string
  errors: Record<string, string[]>
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Partial<ApiValidationError> | undefined
    if (data?.errors) {
      return Object.values(data.errors).flat()[0] ?? data.message ?? fallback
    }
    return data?.message ?? fallback
  }
  return fallback
}
