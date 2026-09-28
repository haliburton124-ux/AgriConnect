import { useEffect } from 'react'
import { Clock, HardHat, Mail, MapPin, Phone } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import { initials } from '@/lib/utils'
import { AvailabilityPicker } from '@/components/technician/AvailabilityPicker'
import { AccountSecurityCards } from '@/components/settings/AccountSecurityCards'

function specializationLabel(keys?: string[]): string {
  if (!keys?.length) return 'Agricultural technician'
  return keys
    .map((key) => String(key).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(' · ')
}

export function TechnicianSettingsPage() {
  const { user, updateUser } = useAuthStore()

  useEffect(() => {
    authService.me().then(({ data }) => updateUser(data.user)).catch(() => {})
  }, [updateUser])

  if (!user) return null

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Field Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your technician profile, availability, and account security.
        </p>
      </div>

      <div className="overflow-hidden rounded-[22px] bg-gradient-to-br from-forest-dark via-forest to-forest-light p-6 text-white shadow-card">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-semibold backdrop-blur-sm">
            {initials(user.first_name, user.last_name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Agricultural Technician</p>
            <h2 className="mt-1 truncate text-xl font-semibold">{user.full_name}</h2>
            <p className="mt-1 text-sm text-white/85">{specializationLabel(user.specializations)}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4" /> Field availability</CardTitle>
        </CardHeader>
        <CardContent>
          <AvailabilityPicker />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><HardHat className="h-4 w-4" /> Technician profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/[0.04] bg-canvas p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Mail className="h-3.5 w-3.5 text-forest" /> Email
              </p>
              <p className="mt-2 break-all text-sm font-medium text-ink">{user.email}</p>
            </div>
            <div className="rounded-2xl border border-black/[0.04] bg-canvas p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Phone className="h-3.5 w-3.5 text-forest" /> Phone
              </p>
              <p className="mt-2 text-sm font-medium text-ink">{user.phone || '—'}</p>
            </div>
            <div className="rounded-2xl border border-black/[0.04] bg-canvas p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-forest" /> Assigned area
              </p>
              <p className="mt-2 text-sm font-medium text-ink">
                {user.barangay?.name ?? '—'}
                {user.municipality?.name ? ` · ${user.municipality.name}` : ''}
              </p>
            </div>
            <div className="rounded-2xl border border-black/[0.04] bg-canvas p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">License</p>
              <p className="mt-2 text-sm font-medium text-ink">{user.license_number || '—'}</p>
              {user.years_experience ? (
                <p className="mt-1 text-xs text-muted-foreground">{user.years_experience} year{user.years_experience === 1 ? '' : 's'} experience</p>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <AccountSecurityCards />
      </div>
    </div>
  )
}
