import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

const badgeVariants = cva('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', {
  variants: {
    variant: {
      pending: 'bg-gold/15 text-gold',
      validated: 'bg-sky/15 text-sky',
      assigned: 'bg-sky/15 text-sky',
      ongoing: 'bg-sky/15 text-sky',
      resolved: 'bg-success/15 text-success',
      rejected: 'bg-danger/15 text-danger',
      low: 'bg-success/15 text-success',
      medium: 'bg-gold/15 text-gold',
      high: 'bg-[#EF6C00]/15 text-[#EF6C00]',
      critical: 'bg-danger/15 text-danger',
      neutral: 'bg-muted text-muted-foreground',
    },
  },
  defaultVariants: { variant: 'neutral' },
})

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
