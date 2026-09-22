import { WifiOff } from 'lucide-react'
import { Button } from './Button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Something went wrong',
  message = "We couldn't load this page. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-black/[0.03] bg-white px-6 py-12 text-center shadow-card">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-forest/10">
        <WifiOff className="h-5 w-5 text-forest" />
      </div>
      <p className="text-base font-semibold text-ink">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button className="mt-5" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  )
}
