import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowRight, BookOpen, Bug, Check, GraduationCap, Handshake, Leaf, Phone,
  Shield, Shovel, Sprout, Tractor, Users, Wheat, Wrench,
} from 'lucide-react'
import { useAuthStore, ROLE_HOME } from '@/store/authStore'
import { useLandingSnapshot } from '@/hooks/useLandingSnapshot'
import { CountUp } from '@/components/landing/CountUp'
import { cn } from '@/lib/utils'

const HERO_FARMER =
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1200&q=80'
const ABOUT_IMAGE =
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1000&q=80'

const CORE_SERVICES = [
  {
    n: '01',
    icon: Leaf,
    title: 'Find Agricultural Services',
    description: 'Discover agricultural services and assistance available for farmers in your community.',
    to: '/services',
  },
  {
    n: '02',
    icon: Users,
    title: 'Connect with Technicians',
    description: 'Connect with agricultural technicians and experts who can provide guidance and support.',
    to: '/agricultural-extension',
  },
  {
    n: '03',
    icon: BookOpen,
    title: 'Access Agricultural Resources',
    description: 'Find useful farming information, guides, announcements, and agricultural resources.',
    to: '/knowledge-center',
  },
  {
    n: '04',
    icon: Handshake,
    title: 'Discover Opportunities',
    description: 'Explore agricultural programs, assistance, events, and opportunities available to farmers.',
    to: '/government-programs',
  },
] as const

const STEPS = [
  { n: '01', icon: Sprout, title: 'Create Your Account', description: 'Create an account and complete your farmer profile.' },
  { n: '02', icon: BookOpen, title: 'Explore Services', description: 'Browse agricultural services, resources, technicians, and opportunities.' },
  { n: '03', icon: Handshake, title: 'Connect & Get Support', description: 'Connect with the appropriate agricultural service or technician.' },
] as const

const FEATURED = [
  { icon: Wheat, label: 'Crop Consultation' },
  { icon: Bug, label: 'Pest & Disease Assistance' },
  { icon: Shovel, label: 'Soil Information' },
  { icon: Tractor, label: 'Farming Techniques' },
  { icon: GraduationCap, label: 'Agricultural Training' },
  { icon: Wrench, label: 'Farm Assistance' },
] as const

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#16A34A]">
      {children}
    </p>
  )
}

function parseStat(value: string): { n: number; suffix: string } | null {
  if (value.includes('/')) return null
  const match = value.match(/^([\d.]+)(.*)$/)
  if (!match) return null
  const n = Number(match[1])
  if (!Number.isFinite(n)) return null
  return { n, suffix: match[2] }
}

export function LandingPageContent() {
  const { stats, updates } = useLandingSnapshot()
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const el = document.querySelector(location.hash)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash])

  const portalFor = (role: 'farmer' | 'technician' | 'org') => {
    if (!isAuthenticated || !user) return '/login'
    if (role === 'farmer') return user.role === 'farmer' ? '/farmer/feed' : '/login'
    if (role === 'technician') return user.role === 'technician' ? '/technician/dashboard' : '/login'
    return ROLE_HOME[user.role] && user.role !== 'farmer' && user.role !== 'technician'
      ? ROLE_HOME[user.role]
      : '/login'
  }

  const getStarted = isAuthenticated ? (user?.role === 'farmer' ? '/farmer/feed' : ROLE_HOME[user?.role ?? ''] ?? '/') : '/register'

  return (
    <div className="bg-white text-[#0F172A]">
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#F0FDF4_0%,#FFFFFF_55%,#FFFFFF_100%)]">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#DCFCE7]/80 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
          <div>
            <span className="inline-flex items-center rounded-full bg-[#DCFCE7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#166534]">
              Agricultural Digital Platform
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-[56px]">
              Connecting Farmers,
              <br />
              <span className="text-[#16A34A]">Technology & Opportunities</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#64748B] sm:text-lg">
              Empowering farmers with accessible agricultural services, resources, information, and digital tools.
              AgriConnect connects farmers with agricultural technicians, services, information, and opportunities — all in one platform.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to={getStarted}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#15803d]"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#services"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-slate-50"
              >
                Explore Services
              </a>
            </div>
          </div>

          <div className="mx-auto w-full max-w-lg lg:max-w-none">
            <div className="overflow-hidden rounded-[22px] border border-slate-100 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.25)]">
              <img src={HERO_FARMER} alt="Farmers working a rice field with a tractor" className="h-[340px] w-full object-cover object-center sm:h-[420px]" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { icon: Users, value: stats.farmersValue, label: stats.farmersLabel },
            { icon: Leaf, value: stats.servicesValue, label: stats.servicesLabel },
            { icon: Phone, value: stats.accessValue, label: stats.accessLabel },
            { icon: Handshake, value: stats.partnersValue, label: stats.partnersLabel },
          ].map((item) => {
            const parsed = parseStat(item.value)
            return (
              <div key={item.label} className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#16A34A]">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0F172A]">
                    {parsed ? <CountUp value={parsed.n} suffix={parsed.suffix} duration={1.2} /> : item.value}
                  </p>
                  <p className="text-xs text-[#64748B]">{item.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section id="about" className="scroll-mt-24 bg-[#F8FAFC] py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="overflow-hidden rounded-[22px] border border-slate-100">
            <img src={ABOUT_IMAGE} alt="Farmer reviewing crops in a green field" className="h-[320px] w-full object-cover sm:h-[400px]" />
          </div>
          <div>
            <SectionLabel>About AgriConnect</SectionLabel>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Making Agriculture More Connected</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#64748B]">
              AgriConnect is a digital agricultural platform designed to help farmers access useful information, services, technicians, opportunities, and agricultural resources in one place.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Easier access to agricultural services',
                'Direct connection with agricultural technicians',
                'Centralized agricultural information',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#0F172A]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A]">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="services" className="scroll-mt-24 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <SectionLabel>What We Offer</SectionLabel>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Core Agricultural Services</h2>
            </div>
            <p className="max-w-md text-sm text-[#64748B]">Everything you need to support your farming journey, all in one platform.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {CORE_SERVICES.map((service) => (
              <article key={service.n} className="rounded-[16px] border border-slate-100 bg-white p-6 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.25)]">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#16A34A]">
                    <service.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold text-[#16A34A]">{service.n}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{service.description}</p>
                <Link to={service.to} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#16A34A] hover:text-[#166534]">
                  Learn More <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <SectionLabel>Getting started is easy</SectionLabel>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">How AgriConnect Works</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {STEPS.map((step) => (
              <article key={step.n} className="rounded-[16px] border border-slate-100 bg-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A]">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold text-[#16A34A]">{step.n}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="updates" className="scroll-mt-24 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <SectionLabel>Agricultural Updates</SectionLabel>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Latest Agricultural Updates</h2>
            </div>
            <p className="max-w-md text-sm text-[#64748B]">Stay informed with the latest news, tips, advisories, and opportunities in agriculture.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {updates.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-[16px] border border-slate-100 bg-white">
                <div className="h-36 overflow-hidden bg-slate-100">
                  {item.image && <img src={item.image} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="p-4">
                  <span className="inline-flex rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#166534]">
                    {item.category}
                  </span>
                  <h3 className="mt-3 line-clamp-2 text-sm font-semibold leading-snug">{item.title}</h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#64748B]">{item.description}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-[#64748B]">
                    <span>{item.date}</span>
                    <Link to={item.href} className="font-semibold text-[#16A34A]">Read More</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built for the Agricultural Community</h2>
          <p className="mt-3 max-w-2xl text-sm text-[#64748B]">AgriConnect is for everyone involved in agriculture. Choose your role and get started.</p>
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              { title: 'Farmers', icon: Sprout, description: 'Access agricultural services, resources, opportunities, and technician support.', to: portalFor('farmer') },
              { title: 'Agricultural Technicians', icon: Shield, description: 'Provide assistance, manage farmer requests, and share agricultural knowledge.', to: portalFor('technician') },
              { title: 'Admin / Agricultural Organizations', icon: GraduationCap, description: 'Manage agricultural information, services, users, and community resources.', to: portalFor('org') },
            ].map((role) => (
              <article key={role.title} className="rounded-[16px] border border-slate-100 bg-white p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#16A34A]">
                  <role.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{role.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{role.description}</p>
                <Link
                  to={role.to}
                  className="mt-6 inline-flex rounded-xl border border-[#16A34A] px-4 py-2 text-sm font-semibold text-[#16A34A] transition-colors hover:bg-[#DCFCE7]"
                >
                  Access Portal
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight">Featured Agricultural Services</h2>
          <p className="mt-3 text-sm text-[#64748B]">Practical support to help you grow and succeed in agriculture.</p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {FEATURED.map((item) => (
              <Link
                key={item.label}
                to="/services"
                className="flex flex-col items-center gap-3 rounded-[16px] border border-slate-100 bg-[#F8FAFC] px-3 py-5 text-center transition-colors hover:border-[#16A34A]/30 hover:bg-[#DCFCE7]/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#16A34A] shadow-sm">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold leading-snug text-[#0F172A]">{item.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 overflow-hidden rounded-[18px] bg-[#16A34A] px-6 py-10 text-white sm:flex-row sm:items-center sm:px-10">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Ready to Connect with Your Agricultural Community?</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/85">
              Join AgriConnect and access agricultural services, information, resources, and opportunities in one platform.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              to={isAuthenticated ? getStarted : '/register'}
              className={cn(
                'inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#166534] hover:bg-slate-50',
              )}
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
