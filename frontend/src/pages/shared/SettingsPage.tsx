import { User as UserIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'
import { ROLE_LABELS } from '@/config/navigation'
import { AccountSecurityCards } from '@/components/settings/AccountSecurityCards'
import { TechnicianSettingsPage } from '@/pages/technician/TechnicianSettingsPage'
import { MaoSettingsPage } from '@/pages/mao/MaoSettingsPage'

export function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  if (!user) return null

  if (user.role === 'technician') {
    return <TechnicianSettingsPage />
  }

  if (user.role === 'municipal_office') {
    return <MaoSettingsPage />
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile and account security.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserIcon className="h-4 w-4" /> Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-xl font-semibold text-white">
              {user.first_name[0]}{user.last_name[0]}
            </div>
            <div>
              <p className="font-semibold text-ink">{user.full_name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <Badge variant="neutral">{ROLE_LABELS[user.role]}</Badge>
                {user.municipality && <span className="text-xs text-muted-foreground">{user.municipality.name}</span>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-black/5 pt-4 text-sm">
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium text-ink">{user.phone}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{user.role === 'farmer' ? 'Barangay' : 'Location'}</p>
              <p className="font-medium text-ink">{user.barangay?.name ?? user.municipality?.name ?? '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <AccountSecurityCards />
    </div>
  )
}
