import { Link } from 'react-router-dom'
import { Building2, Mail, MapPin, Phone, Users, UserCog, AlertTriangle, FileBarChart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuthStore } from '@/store/authStore'
import { initials } from '@/lib/utils'
import { AccountSecurityCards } from '@/components/settings/AccountSecurityCards'

const OFFICE_LINKS = [
  { to: '/mao/technicians', label: 'Technicians', description: 'View and assign field staff', icon: Users },
  { to: '/mao/farmers', label: 'Farmers', description: 'Municipality farmer directory', icon: UserCog },
  { to: '/mao/incidents', label: 'Incidents', description: 'Validate and assign reports', icon: AlertTriangle },
  { to: '/mao/reports', label: 'Reports', description: 'Municipal agriculture reports', icon: FileBarChart },
] as const

export function MaoSettingsPage() {
  const user = useAuthStore((s) => s.user)
  if (!user) return null

  const municipality = user.municipality?.name ?? 'Your municipality'

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Office Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Municipal Agriculture Office account for {municipality}.
        </p>
      </div>

      <div className="overflow-hidden rounded-[22px] bg-gradient-to-br from-forest-dark via-forest to-forest-light p-6 text-white shadow-card">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-semibold backdrop-blur-sm">
            {initials(user.first_name, user.last_name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Municipal Agriculture Office</p>
            <h2 className="mt-1 truncate text-xl font-semibold">{user.full_name}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/85">
              <Building2 className="h-4 w-4" />
              {municipality}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Office profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-black/[0.04] bg-canvas p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 text-forest" /> Official email
                </p>
                <p className="mt-2 break-all text-sm font-medium text-ink">{user.email}</p>
              </div>
              <div className="rounded-2xl border border-black/[0.04] bg-canvas p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 text-forest" /> Office phone
                </p>
                <p className="mt-2 text-sm font-medium text-ink">{user.phone || '—'}</p>
              </div>
              <div className="rounded-2xl border border-black/[0.04] bg-canvas p-4 sm:col-span-2">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-forest" /> Coverage
                </p>
                <p className="mt-2 text-sm font-medium text-ink">{municipality}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  You can view technicians, farmers, and incident reports only within this municipality.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Office shortcuts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {OFFICE_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-start gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-forest/5"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest/10 text-forest">
                  <item.icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink">{item.label}</span>
                  <span className="block text-xs text-muted-foreground">{item.description}</span>
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AccountSecurityCards />
      </div>
    </div>
  )
}
