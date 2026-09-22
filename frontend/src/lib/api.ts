import axios from 'axios'
import { beginTrackedRequest, endTrackedRequest, isNavigationPending, shouldSkipLoader } from '@/store/loadingStore'

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipLoader?: boolean
    loaderGen?: number
  }
}

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
  // Axios must set the multipart boundary itself. A bare
  // `Content-Type: multipart/form-data` makes PHP drop the body.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type')
    } else {
      delete (config.headers as Record<string, unknown>)['Content-Type']
    }
  }

  const method = (config.method ?? 'get').toLowerCase()
  const url = `${config.baseURL ?? ''}${config.url ?? ''}`
  if (method === 'get' && !shouldSkipLoader(url, config.skipLoader)) {
    config.loaderGen = beginTrackedRequest()
  }

  return config
})

api.interceptors.response.use(
  (response) => {
    if (response.config.loaderGen != null) {
      endTrackedRequest(response.config.loaderGen)
    }
    return response
  },
  (error) => {
    const config = axios.isAxiosError(error) ? error.config : undefined
    if (config?.loaderGen != null) {
      const status = error.response?.status as number | undefined
      const failed = isNavigationPending() && (!error.response || (status != null && status >= 500))
        ? (!error.response
          ? "We couldn’t load this page. Check your connection and try again."
          : "We couldn’t load this page")
        : undefined
      endTrackedRequest(config.loaderGen, failed)
    }
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
