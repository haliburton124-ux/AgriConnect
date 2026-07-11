import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { api } from '@/lib/api'
import type { GisFilters } from '@/services/gisService'
import type { IncidentCategory } from '@/types'

interface Option {
  id: number
  name: string
}

interface GisFilterModalProps {
  open: boolean
  onClose: () => void
  filters: GisFilters
  onApply: (filters: GisFilters) => void
  /** Municipal Office is always scoped to its own LGU — hide that filter for them. */
  showMunicipalityFilter: boolean
}

const SEVERITIES = ['low', 'medium', 'high', 'critical']
const STATUSES = ['pending', 'validated', 'assigned', 'ongoing', 'resolved', 'rejected']

export function GisFilterModal({ open, onClose, filters, onApply, showMunicipalityFilter }: GisFilterModalProps) {
  const [draft, setDraft] = useState<GisFilters>(filters)
  const [municipalities, setMunicipalities] = useState<Option[]>([])
  const [barangays, setBarangays] = useState<Option[]>([])
  const [categories, setCategories] = useState<IncidentCategory[]>([])

  useEffect(() => {
    if (!open) return
    setDraft(filters)
    api.get('/locations/incident-categories').then((res) => setCategories(res.data.data))
    if (showMunicipalityFilter) {
      api.get('/locations/municipalities').then((res) => setMunicipalities(res.data.data))
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (draft.municipality_id) {
      api.get('/locations/barangays', { params: { municipality_id: draft.municipality_id } }).then((res) => setBarangays(res.data.data))
    } else {
      setBarangays([])
    }
  }, [draft.municipality_id])

  const handleApply = () => {
    onApply(draft)
    onClose()
  }

  const handleReset = () => {
    const cleared: GisFilters = {}
    setDraft(cleared)
    onApply(cleared)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Filter Map"
      description="Narrow down which incidents appear on the map."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleReset}>Clear Filters</Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </>
      }
    >
      <div className="space-y-4">
        {showMunicipalityFilter && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Municipality</label>
            <select
              className="h-11 w-full rounded-xl border-2 border-input bg-white px-4 text-sm focus-visible:outline-none focus-visible:border-forest-light"
              value={draft.municipality_id ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, municipality_id: e.target.value ? Number(e.target.value) : undefined, barangay_id: undefined }))}
            >
              <option value="">All municipalities</option>
              {municipalities.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        )}

        {draft.municipality_id !== undefined && barangays.length > 0 && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Barangay</label>
            <select
              className="h-11 w-full rounded-xl border-2 border-input bg-white px-4 text-sm focus-visible:outline-none focus-visible:border-forest-light"
              value={draft.barangay_id ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, barangay_id: e.target.value ? Number(e.target.value) : undefined }))}
            >
              <option value="">All barangays</option>
              {barangays.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Incident Category</label>
          <select
            className="h-11 w-full rounded-xl border-2 border-input bg-white px-4 text-sm focus-visible:outline-none focus-visible:border-forest-light"
            value={draft.category_id ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, category_id: e.target.value ? Number(e.target.value) : undefined }))}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Severity</label>
            <select
              className="h-11 w-full rounded-xl border-2 border-input bg-white px-4 text-sm capitalize focus-visible:outline-none focus-visible:border-forest-light"
              value={draft.severity ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, severity: e.target.value || undefined }))}
            >
              <option value="">Any severity</option>
              {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Status</label>
            <select
              className="h-11 w-full rounded-xl border-2 border-input bg-white px-4 text-sm capitalize focus-visible:outline-none focus-visible:border-forest-light"
              value={draft.status ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value || undefined }))}
            >
              <option value="">Any status</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="From"
            value={draft.date_from ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, date_from: e.target.value || undefined }))}
          />
          <Input
            type="date"
            label="To"
            value={draft.date_to ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, date_to: e.target.value || undefined }))}
          />
        </div>
      </div>
    </Modal>
  )
}
