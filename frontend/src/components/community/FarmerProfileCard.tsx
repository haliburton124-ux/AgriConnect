import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { cn, initials } from '@/lib/utils'

interface FarmerProfileCardProps {
  className?: string
}

export function FarmerProfileCard({ className }: FarmerProfileCardProps) {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const isFarmer = isAuthenticated && user?.role === 'farmer'

  if (!isFarmer || !user) {
    return (
      <Card className={cn('overflow-hidden border-forest/10 bg-gradient-to-br from-forest/[0.04] to-sky/[0.04]', className)}>
        <CardContent className="space-y-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/10 text-forest">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-ink">Farmer Profile</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink/65">
              Sign in to save shared advisories and manage your community activity.
            </p>
          </div>
          <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
            Sign in
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Link to="/farmer/profile" className={cn('block group', className)}>
      <Card className="overflow-hidden border-forest/10 bg-gradient-to-br from-forest/[0.05] to-teal-500/[0.04] transition-shadow hover:shadow-glass">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-white shadow-card">
            {initials(user.first_name, user.last_name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{user.full_name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <p className="mt-0.5 text-[11px] font-medium text-forest">My profile · shared posts</p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-forest/50 transition-transform group-hover:translate-x-0.5 group-hover:text-forest" />
        </CardContent>
      </Card>
    </Link>
  )
}
