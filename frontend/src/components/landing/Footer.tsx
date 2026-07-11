import { Link } from 'react-router-dom'
import { Sprout, MapPin, Phone, Mail, Facebook, Instagram } from 'lucide-react'
import { PUBLIC_NAV_LINKS } from '@/config/farmerPublicNav'

const COLUMNS = [
  {
    title: 'Explore',
    links: PUBLIC_NAV_LINKS.filter((l) => l.path !== '/').map((l) => ({ label: l.label, to: l.path })),
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign In', to: '/login' },
      { label: 'Register', to: '/register' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-forest-dark px-4 pb-8 pt-20 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Sprout className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-bold leading-none">AgriConnect</p>
                <p className="mt-1 text-[11px] text-white/60">Ilocos Norte</p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
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

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold uppercase tracking-wide text-white/50">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-white/75 transition-colors hover:text-white">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/50">Contact</p>
            <ul className="mt-4 space-y-3 text-sm text-white/75">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                Provincial Capitol Complex, Laoag City, Ilocos Norte
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-white/50" />
                (077) 000-0000
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-white/50" />
                agriculture@ilocosnorte.gov.ph
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-white">View contact page →</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Provincial Agriculture Office of Ilocos Norte. All rights reserved.</p>
          <p>Built for the farmers of Ilocos Norte.</p>
        </div>
      </div>
    </footer>
  )
}
