import { Link } from 'react-router-dom'
import { Sprout } from 'lucide-react'

const COLUMNS = [
  {
    title: 'Platform',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Services', to: '/#services' },
      { label: 'Resources', to: '/knowledge-center' },
      { label: 'Updates', to: '/#updates' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Farmers', to: '/register' },
      { label: 'Technicians', to: '/login' },
      { label: 'Agricultural Organizations', to: '/login' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact', to: '/contact' },
      { label: 'Help Center', to: '/contact' },
      { label: 'Privacy Policy', to: '/contact' },
      { label: 'Terms of Service', to: '/contact' },
    ],
  },
] as const

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-100 bg-[#F8FAFC]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16A34A] text-white">
              <Sprout className="h-5 w-5" />
            </div>
            <span className="text-[17px] font-bold text-[#0F172A]">AgriConnect</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#64748B]">
            Stronger Farmers. Healthier Communities. A digital agricultural platform connecting farmers, technicians, and agricultural offices.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="text-sm font-semibold text-[#0F172A]">{column.title}</p>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-[#64748B] transition-colors hover:text-[#16A34A]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-[#64748B] sm:flex-row sm:px-6 lg:px-8">
          <p>© 2026 AgriConnect. All rights reserved.</p>
          <p>Built for the agricultural community.</p>
        </div>
      </div>
    </footer>
  )
}
