import { forwardRef, useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: string
  label?: string
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, label, id, ...props }, ref) => {
    const [visible, setVisible] = useState(false)

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={id}
            ref={ref}
            type={visible ? 'text' : 'password'}
            className={cn(
              'flex h-11 w-full rounded-xl border-2 border-input bg-white px-4 py-2 pr-11 text-sm transition-colors',
              'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-forest-light',
              error && 'border-danger focus-visible:border-danger',
              className,
            )}
            aria-invalid={Boolean(error)}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-ink"
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      </div>
    )
  },
)
PasswordInput.displayName = 'PasswordInput'
