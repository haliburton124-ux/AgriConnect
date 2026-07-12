import { Link } from 'react-router-dom'
import {
  Sprout, Facebook, Instagram, AlertTriangle, BookOpen, MapPin, Gift, ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

const HIGHLIGHTS = [
  {
    icon: AlertTriangle,
    title: 'GPS Incident Reporting',
    description: 'Flag crop disease, pests, or emergencies and track response in real time.',
    to: '/services',
  },
  {
    icon: BookOpen,
    title: 'Knowledge Sharing',
    description: 'Browse public advisories from municipalities across the province.',
    to: '/knowledge-center',
  },
  {
    icon: MapPin,
    title: 'Farm Registration',
    description: 'Pin your farm on the map so technicians can find you faster.',
    to: '/register',
  },
  {
    icon: Gift,
    title: 'Government Programs',
    description: 'Discover subsidies, training, loans, and equipment support.',
    to: '/government-programs',
  },
] as const

export function Footer() {
  return (
    <footer className="bg-forest-dark px-4 pb-8 pt-20 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Sprout className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-bold leading-none">AgriConnect</p>
                <p className="mt-1 text-[11px] text-white/60">Ilocos Norte</p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/60">
              A real-time agricultural extension and farm incident response platform
              connecting farmers with the Provincial and Municipal Agriculture Offices
              of Ilocos Norte.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="#" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/50">What you can do</p>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {HIGHLIGHTS.map(({ icon: Icon, title, description, to }) => (
                <Link
                  key={title}
                  to={to}
                  className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.08]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-forest-light transition-colors group-hover:bg-white/15">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-white">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/55">{description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-6 sm:flex-row sm:px-8">
          <div>
            <p className="text-base font-semibold text-white">Ready to connect with your agriculture office?</p>
            <p className="mt-1 text-sm text-white/60">Create a free account to report incidents, register farms, and access programs.</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <Link to="/register">
              <Button className="bg-white text-forest hover:bg-white/90">
                Create Account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login" className="text-sm font-medium text-white/75 transition-colors hover:text-white">
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Provincial Agriculture Office of Ilocos Norte. All rights reserved.</p>
          <p>Built for the farmers of Ilocos Norte.</p>
        </div>
      </div>
    </footer>
  )
}
