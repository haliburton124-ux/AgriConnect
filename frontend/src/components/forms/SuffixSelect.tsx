import { cn } from '@/lib/utils'
import { PH_SUFFIX_OPTIONS } from '@/lib/phone'

interface SuffixSelectProps {
  id?: string
  label?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
}

export function SuffixSelect({
  id,
  label = 'Suffix (optional)',
  value,
  onChange,
  onBlur,
  error,
}: SuffixSelectProps) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'flex h-11 w-full rounded-xl border-2 border-input bg-white px-4 py-2 text-sm transition-colors',
          'focus-visible:outline-none focus-visible:border-forest-light',
          error && 'border-danger focus-visible:border-danger',
          !value && 'text-muted-foreground',
        )}
        aria-invalid={Boolean(error)}
      >
        <option value="">None</option>
        {PH_SUFFIX_OPTIONS.map((suffix) => (
          <option key={suffix} value={suffix}>
            {suffix}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  )
}
