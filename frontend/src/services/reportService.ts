import { api } from '@/lib/api'
import type { UserRole } from '@/types'

export interface ReportExportParams {
  format: 'csv' | 'xlsx' | 'pdf'
  date_from?: string
  date_to?: string
  municipality_id?: number
}

const EXTENSIONS: Record<ReportExportParams['format'], string> = {
  csv: 'csv',
  xlsx: 'xlsx',
  pdf: 'pdf',
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
      throw new Error(`Reports are not available for role: ${role}`)
  }
}

/**
 * Triggers the incident report export and saves it to the browser's
 * downloads — the backend streams the file directly (no JSON envelope),
 * so this reads the response as a blob and creates a temporary object URL.
 */
export async function exportIncidentReport(role: UserRole, params: ReportExportParams): Promise<void> {
  const response = await api.post(`${basePath(role)}/reports/incidents/export`, params, {
    responseType: 'blob',
  })

  const blob = new Blob([response.data])
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  const stamp = new Date().toISOString().slice(0, 10)

  link.href = url
  link.download = `agriri-incident-report-${stamp}.${EXTENSIONS[params.format]}`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
