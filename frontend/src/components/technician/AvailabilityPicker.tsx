import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { getApiErrorMessage } from '@/lib/api'
import type { User } from '@/types'

const OPTIONS: { value: NonNullable<User['availability']>; label: string; hint: string }[] = [
  { value: 'available', label: 'Available', hint: 'Ready for new assignments' },
  { value: 'busy', label: 'On Field Visit', hint: 'Currently out in the field' },
  { value: 'on_leave', label: 'On Leave', hint: 'Not available for new cases' },
]

export function AvailabilityPicker({ compact = false }: { compact?: boolean }) {
  const { user, updateUser } = useAuthStore()
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    if (user?.role !== 'technician') return
    let cancelled = false
    authService.me().then(({ data }) => {
      if (!cancelled) updateUser(data.user)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [user?.role, updateUser])

  if (!user || user.role !== 'technician') return null

  const current = user.availability ?? 'available'

  const select = async (availability: NonNullable<User['availability']>) => {
    if (availability === current || saving) return
    setSaving(availability)
    try {
      const { data } = await authService.updateAvailability(availability)
      updateUser(data.user)
      toast.success('Availability updated.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not update availability.'))
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className={cn(!compact && 'space-y-2')}>
      {!compact && (
        <p className="text-sm text-ink/70">
          Let the Municipal Agriculture Office know if you are available, on a field visit, or on leave.
        </p>
      )}
      <div className={cn('flex flex-wrap gap-2', compact && 'justify-end')}>
        {OPTIONS.map((option) => {
          const active = current === option.value
          return (
            <button
              key={option.value}
              type="button"
              disabled={saving !== null}
              title={option.hint}
              onClick={() => select(option.value)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60',
                active
                  ? 'bg-gradient-primary text-white shadow-card'
                  : 'border border-black/5 bg-white text-ink/70 hover:bg-forest/5',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
