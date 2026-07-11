import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { FileSpreadsheet, FileText, FileType2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { api, getApiErrorMessage } from '@/lib/api'
import { exportIncidentReport, type ReportExportParams } from '@/services/reportService'
import { useAuthStore } from '@/store/authStore'

interface ExportReportModalProps {
  open: boolean
  onClose: () => void
}

const FORMATS: { value: ReportExportParams['format']; label: string; icon: typeof FileText; hint: string }[] = [
  { value: 'pdf', label: 'PDF', icon: FileType2, hint: 'Branded, printable summary' },
  { value: 'xlsx', label: 'Excel', icon: FileSpreadsheet, hint: 'For further analysis' },
  { value: 'csv', label: 'CSV', icon: FileText, hint: 'Raw data, any tool' },
]

/**
 * "Export Report Modal" — lets Municipal/Provincial Office and Admin
 * download the incident report in their preferred format. Municipal Office
 * is always scoped to its own LGU server-side; Provincial Office/Admin can
 * optionally target one municipality or leave it blank for province-wide.
 */
export function ExportReportModal({ open, onClose }: ExportReportModalProps) {
  const { user } = useAuthStore()
  const role = user!.role
  const showMunicipalityFilter = role !== 'municipal_office'

  const [format, setFormat] = useState<ReportExportParams['format']>('pdf')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [municipalityId, setMunicipalityId] = useState<number | ''>('')
  const [municipalities, setMunicipalities] = useState<{ id: number; name: string }[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open && showMunicipalityFilter) {
      api.get('/locations/municipalities').then((res) => setMunicipalities(res.data.data))
    }
  }, [open, showMunicipalityFilter])

  const handleExport = async () => {
    setSubmitting(true)
    try {
      await exportIncidentReport(role, {
        format,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        municipality_id: municipalityId || undefined,
      })
      toast.success('Report downloaded successfully.')
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not generate the report. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Export Incident Report"
      description="Download a report of incidents matching your selected criteria."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleExport} loading={submitting}>Download Report</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">Format</label>
          <div className="grid grid-cols-3 gap-3">
            {FORMATS.map(({ value, label, icon: Icon, hint }) => (
              <button
                key={value}
                onClick={() => setFormat(value)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 text-center transition-colors',
                  format === value ? 'border-forest bg-forest/5' : 'border-black/5 hover:border-forest-light/40',
                )}
              >
                <Icon className={cn('h-6 w-6', format === value ? 'text-forest' : 'text-muted-foreground')} />
                <span className="text-sm font-semibold text-ink">{label}</span>
                <span className="text-[11px] text-muted-foreground">{hint}</span>
              </button>
            ))}
          </div>
        </div>

        {showMunicipalityFilter && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Municipality</label>
            <select
              className="h-11 w-full rounded-xl border-2 border-input bg-white px-4 text-sm focus-visible:outline-none focus-visible:border-forest-light"
              value={municipalityId}
              onChange={(e) => setMunicipalityId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">All municipalities (province-wide)</option>
              {municipalities.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input type="date" label="From" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <Input type="date" label="To" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
      </div>
    </Modal>
  )
}
