import type { LucideIcon } from 'lucide-react'
import { Button } from './Button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-forest-light/30 bg-forest/[0.02] px-6 py-16 text-center animate-fade-in">
      <div className="mb-4 rounded-full bg-forest/10 p-4">
        <Icon className="h-8 w-8 text-forest" />
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
