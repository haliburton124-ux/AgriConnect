import { Sprout } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AgriSpinner({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <div
      className={cn('relative', size === 'sm' ? 'h-8 w-8' : 'h-12 w-12')}
      role="status"
      aria-label="Loading"
    >
      <div
        className={cn(
          'absolute inset-0 rounded-full border-forest/15 border-t-forest animate-spin',
          size === 'sm' ? 'border-[2.5px]' : 'border-[3px]',
        )}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Sprout className={cn('text-forest', size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5')} />
      </div>
    </div>
  )
}
