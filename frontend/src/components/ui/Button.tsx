import { forwardRef, type ButtonHTMLAttributes, useState, type MouseEvent } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'btn-ripple inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-primary text-white shadow-card hover:shadow-glow hover:brightness-105',
        tech: 'bg-gradient-tech text-white shadow-card hover:shadow-glow hover:brightness-105',
        outline: 'border-2 border-forest text-forest bg-transparent hover:bg-forest/5',
        ghost: 'text-ink hover:bg-forest/5',
        danger: 'bg-danger text-white hover:brightness-105',
        link: 'text-forest underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-4 text-xs',
        md: 'h-11 px-6',
        lg: 'h-13 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

/** Ripple-on-click micro-interaction, per the AgriConnect animation spec. */
function useRipple() {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])

  const addRipple = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const id = Date.now()
    setRipples((prev) => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top, id }])
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600)
  }

  return { ripples, addRipple }
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, onClick, disabled, ...props }, ref) => {
    const { ripples, addRipple } = useRipple()

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        onClick={(e) => {
          addRipple(e)
          onClick?.(e)
        }}
        {...props}
      >
        {ripples.map((r) => (
          <span
            key={r.id}
            className="absolute rounded-full bg-white/40 animate-ripple pointer-events-none"
            style={{ left: r.x - 10, top: r.y - 10, width: 20, height: 20 }}
          />
        ))}
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
