import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useMunicipalityBarangays } from '@/hooks/useMunicipalityBarangays'

const selectClassName =
  'h-11 w-full rounded-xl border-2 border-input bg-white px-3 text-sm text-ink transition-colors focus-visible:border-forest-light focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground'

function toSelectValue(value?: number | string | null) {
  if (value == null || value === '') return ''
  const normalized = String(value)
  return Number.isFinite(Number(normalized)) && Number(normalized) > 0 ? normalized : ''
}

interface MunicipalityBarangayFieldsProps {
  municipalityId?: number | string | null
  barangayId?: number | string | null
  onMunicipalityChange: (value: string) => void
  onBarangayChange: (value: string) => void
  municipalityError?: string
  barangayError?: string
  className?: string
}

export function MunicipalityBarangayFields({
  municipalityId,
  barangayId,
  onMunicipalityChange,
  onBarangayChange,
  municipalityError,
  barangayError,
  className,
}: MunicipalityBarangayFieldsProps) {
  const [activeMunicipalityId, setActiveMunicipalityId] = useState(() => toSelectValue(municipalityId))
  const [activeBarangayId, setActiveBarangayId] = useState(() => toSelectValue(barangayId))

  useEffect(() => {
    setActiveMunicipalityId(toSelectValue(municipalityId))
  }, [municipalityId])

  useEffect(() => {
    setActiveBarangayId(toSelectValue(barangayId))
  }, [barangayId])

  const {
    municipalities,
    barangays,
    loadingMunicipalities,
    loadingBarangays,
    barangayError: barangayLoadError,
    hasMunicipality,
  } = useMunicipalityBarangays(activeMunicipalityId)

  const handleMunicipalityChange = (value: string) => {
    setActiveMunicipalityId(value)
    setActiveBarangayId('')
    onMunicipalityChange(value)
    onBarangayChange('')
  }

  const handleBarangayChange = (value: string) => {
    setActiveBarangayId(value)
    onBarangayChange(value)
  }

  const barangayPlaceholder = !hasMunicipality
    ? 'Select a municipality first'
    : loadingBarangays
      ? 'Loading barangays…'
      : barangays.length === 0
        ? barangayLoadError ?? 'No barangays found'
        : 'Select barangay…'

  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2', className)}>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Municipality</label>
        <select
          value={activeMunicipalityId}
          onChange={(e) => handleMunicipalityChange(e.target.value)}
          className={selectClassName}
          disabled={loadingMunicipalities}
        >
          <option value="">Select municipality…</option>
          {municipalities.map((municipality) => (
            <option key={municipality.id} value={String(municipality.id)}>
              {municipality.name}
            </option>
          ))}
        </select>
        {municipalityError && <p className="mt-1.5 text-xs text-danger">{municipalityError}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Barangay</label>
        <select
          key={`barangay-${activeMunicipalityId || 'none'}`}
          value={activeBarangayId}
          onChange={(e) => handleBarangayChange(e.target.value)}
          className={selectClassName}
          disabled={!hasMunicipality}
        >
          <option value="">{barangayPlaceholder}</option>
          {barangays.map((barangay) => (
            <option key={barangay.id} value={String(barangay.id)}>
              {barangay.name}
            </option>
          ))}
        </select>
        {(barangayError || barangayLoadError) && (
          <p className="mt-1.5 text-xs text-danger">{barangayError ?? barangayLoadError}</p>
        )}
      </div>
    </div>
  )
}
