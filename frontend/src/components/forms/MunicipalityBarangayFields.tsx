import { cn } from '@/lib/utils'
import { useMunicipalityBarangays } from '@/hooks/useMunicipalityBarangays'

const selectClassName =
  'h-11 w-full rounded-xl border-2 border-input bg-white px-3 text-sm text-ink transition-colors focus-visible:border-forest-light focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground'

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
  const {
    municipalities,
    barangays,
    loadingMunicipalities,
    loadingBarangays,
    hasMunicipality,
  } = useMunicipalityBarangays(municipalityId)

  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2', className)}>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Municipality</label>
        <select
          value={municipalityId ?? ''}
          onChange={(e) => onMunicipalityChange(e.target.value)}
          className={selectClassName}
          disabled={loadingMunicipalities}
        >
          <option value="">Select municipality…</option>
          {municipalities.map((municipality) => (
            <option key={municipality.id} value={municipality.id}>
              {municipality.name}
            </option>
          ))}
        </select>
        {municipalityError && <p className="mt-1.5 text-xs text-danger">{municipalityError}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Barangay</label>
        <select
          key={`barangay-${municipalityId ?? 'none'}`}
          value={barangayId ?? ''}
          onChange={(e) => onBarangayChange(e.target.value)}
          className={selectClassName}
          disabled={!hasMunicipality || loadingBarangays}
        >
          <option value="">
            {!hasMunicipality
              ? 'Select a municipality first'
              : loadingBarangays
                ? 'Loading barangays…'
                : barangays.length === 0
                  ? 'No barangays found'
                  : 'Select barangay…'}
          </option>
          {barangays.map((barangay) => (
            <option key={barangay.id} value={barangay.id}>
              {barangay.name}
            </option>
          ))}
        </select>
        {barangayError && <p className="mt-1.5 text-xs text-danger">{barangayError}</p>}
      </div>
    </div>
  )
}
