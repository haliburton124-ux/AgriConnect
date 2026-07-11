import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('skeleton', className)} {...props} />
}

/** Pre-built skeleton for a KPI card, incident row, etc. */
export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-card space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}
