import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = "We couldn't load this data. Please try again.", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-danger/5 px-6 py-12 text-center">
      <AlertTriangle className="h-8 w-8 text-danger" />
      <p className="mt-3 text-sm font-medium text-ink">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
