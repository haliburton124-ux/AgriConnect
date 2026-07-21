import { cn } from '@/lib/utils'
import { normalizePhilippinePhoneInput } from '@/lib/phone'

interface PhilippinePhoneInputProps {
  id?: string
  label?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  disabled?: boolean
}

export function PhilippinePhoneInput({
  id,
  label = 'Mobile number',
  value,
  onChange,
  onBlur,
  error,
  disabled,
}: PhilippinePhoneInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex h-11 overflow-hidden rounded-xl border-2 border-input bg-white transition-colors focus-within:border-forest-light',
          error && 'border-danger focus-within:border-danger',
        )}
      >
        <span className="flex shrink-0 items-center border-r border-input bg-canvas px-3 text-sm font-semibold text-forest">
          +63
        </span>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="9XXXXXXXXX"
          value={value}
          disabled={disabled}
          onBlur={onBlur}
          onChange={(event) => onChange(normalizePhilippinePhoneInput(event.target.value))}
          className="min-w-0 flex-1 bg-white px-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none"
          aria-invalid={Boolean(error)}
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-danger">{error}</p>
      ) : (
        <p className="mt-1.5 text-xs text-muted-foreground">Enter 10 digits starting with 9.</p>
      )}
    </div>
  )
}
