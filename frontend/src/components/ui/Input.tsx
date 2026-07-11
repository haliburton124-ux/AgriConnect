import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            'flex h-11 w-full rounded-xl border-2 border-input bg-white px-4 py-2 text-sm transition-colors',
            'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-forest-light',
            error && 'border-danger focus-visible:border-danger',
            className,
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'
