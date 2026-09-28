import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, Briefcase, HardHat, Mail, MapPin, MessageCircle, Phone, Plus, Search,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { incidentService, type MaoTechnician, type TechnicianAvailability } from '@/services/incidentService'
import { getApiErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'
import { CreateTechnicianModal } from '@/components/modals/CreateTechnicianModal'

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=70',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=70',
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=70',
]

const AVAILABILITY: Record<TechnicianAvailability, { label: string; className: string; dot: string }> = {
  available: { label: 'Available', className: 'bg-white/90 text-forest', dot: 'bg-success' },
  busy: { label: 'On Field Visit', className: 'bg-white/90 text-sky', dot: 'bg-sky' },
  on_leave: { label: 'On Leave', className: 'bg-white/90 text-gold', dot: 'bg-gold' },
}

function nameInitials(fullName: string, first?: string, last?: string): string {
  if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function specializationLabel(keys?: string[]): string {
  if (!keys?.length) return 'Agricultural technician'
  return keys
    .map((key) => String(key).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(' · ')
}

export function MaoTechniciansPage() {
  const [technicians, setTechnicians] = useState<MaoTechnician[] | null>(null)
  const [search, setSearch] = useState('')
  const [availability, setAvailability] = useState<TechnicianAvailability | ''>('')
  const [selected, setSelected] = useState<MaoTechnician | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const load = () => {
    incidentService
      .listTechnicians()
      .then((res) => setTechnicians(res.data.data))
      .catch((error) => {
        setTechnicians([])
        toast.error(getApiErrorMessage(error, 'Could not load technicians.'))
      })
  }

  useEffect(load, [])

  const filtered = useMemo(() => {
    if (!technicians) return []
    const q = search.trim().toLowerCase()
    return technicians.filter((tech) => {
      if (availability && (tech.availability ?? 'available') !== availability) return false
      if (!q) return true
      const haystack = [
        tech.full_name,
        tech.email,
        tech.phone,
        tech.barangay?.name,
        tech.municipality?.name,
        specializationLabel(tech.specializations),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [technicians, search, availability])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Agricultural Technicians</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Active technicians available for assignment in your municipality.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Add Technician
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-wrap gap-2">
          {([
            { value: '', label: 'All' },
            { value: 'available', label: 'Available' },
            { value: 'busy', label: 'On Field Visit' },
            { value: 'on_leave', label: 'On Leave' },
          ] as const).map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setAvailability(tab.value)}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
                availability === tab.value
                  ? 'bg-gradient-primary text-white shadow-card'
                  : 'border border-black/5 bg-white text-ink/60 hover:bg-forest/5',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full min-w-0 lg:max-w-xs lg:shrink-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search technicians…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {technicians === null ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-[360px] w-full rounded-[22px]" />)}
        </div>
      ) : technicians.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState icon={HardHat} title="No technicians yet" description="Add a technician account so you can assign incident reports in your municipality." />
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState icon={Search} title="No matching technicians" description="Try a different search or availability filter." />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((tech, i) => (
            <TechnicianCard key={tech.id} tech={tech} index={i} onView={() => setSelected(tech)} />
          ))}
        </div>
      )}

      <TechnicianProfileModal tech={selected} onClose={() => setSelected(null)} />
      <CreateTechnicianModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          setTechnicians(null)
          load()
        }}
      />
    </div>
  )
}

function TechnicianCard({
  tech,
  index,
  onView,
}: {
  tech: MaoTechnician
  index: number
  onView: () => void
}) {
  const status = AVAILABILITY[tech.availability ?? 'available']
  const cover = COVER_IMAGES[tech.id % COVER_IMAGES.length]
  const assigned = tech.assigned_cases ?? 0
  const workload = tech.workload ?? 0

  return (
    <motion.div className="h-full" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <article className="flex h-full flex-col rounded-[22px] border border-black/[0.04] bg-white shadow-card">
        <div className="relative h-[108px] shrink-0 overflow-hidden rounded-t-[22px]">
          <img src={cover} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/50 via-forest/15 to-transparent" />
          <span className={cn('absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm', status.className)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
            {status.label}
          </span>
        </div>

        <div className="flex flex-1 flex-col px-5 pb-5">
          <div className="relative z-10 -mt-9 mb-3">
            {tech.avatar_url ? (
              <img
                src={tech.avatar_url}
                alt={tech.full_name}
                className="h-16 w-16 rounded-full object-cover ring-[3px] ring-white shadow-card"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-base font-semibold text-white ring-[3px] ring-white shadow-card">
                {nameInitials(tech.full_name, tech.first_name, tech.last_name)}
              </div>
            )}
          </div>

          <h2 className="truncate text-lg font-semibold leading-tight text-ink">{tech.full_name}</h2>
          <p className="mt-1 line-clamp-1 min-h-5 text-sm text-muted-foreground">{specializationLabel(tech.specializations)}</p>

          <ul className="mt-4 space-y-2 text-sm text-ink/80">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-forest" />
              <span className="truncate">{tech.barangay?.name ?? 'No barangay assigned'}{tech.municipality?.name ? ` · ${tech.municipality.name}` : ''}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-forest" />
              <a href={`tel:${tech.phone}`} className="truncate hover:text-forest">{tech.phone || '—'}</a>
            </li>
            <li className="flex min-h-5 items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-forest" />
              {tech.email ? (
                <a href={`mailto:${tech.email}`} className="truncate hover:text-forest">{tech.email}</a>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </li>
          </ul>

          <div className="mt-auto grid grid-cols-2 gap-4 border-t border-black/5 pt-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Assigned</p>
              <p className="mt-1 flex h-7 items-baseline gap-1">
                <span className="text-lg font-bold leading-none text-ink">{assigned}</span>
                <span className="text-xs font-medium text-muted-foreground">cases</span>
              </p>
              <div className="mt-1.5 h-1.5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Workload</p>
              <p className="mt-1 flex h-7 items-baseline">
                <span className="text-lg font-bold leading-none text-ink">{workload}%</span>
              </p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-forest/10">
                <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${Math.min(100, Math.max(0, workload))}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onView}
              className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:text-forest-dark"
            >
              View profile <ArrowRight className="h-4 w-4" />
            </button>
            <div className="flex gap-2">
              {tech.email && (
                <a
                  href={`mailto:${tech.email}`}
                  aria-label={`Email ${tech.full_name}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/10 text-forest transition-colors hover:bg-forest/15"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
              <a
                href={`tel:${tech.phone}`}
                aria-label={`Call ${tech.full_name}`}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/10 text-forest transition-colors hover:bg-forest/15"
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </article>
    </motion.div>
  )
}

function TechnicianProfileModal({ tech, onClose }: { tech: MaoTechnician | null; onClose: () => void }) {
  const navigate = useNavigate()
  const status = tech ? AVAILABILITY[tech.availability ?? 'available'] : null

  return (
    <Modal
      open={Boolean(tech)}
      onClose={onClose}
      title={tech?.full_name ?? 'Technician profile'}
      description="Municipal Agriculture Office directory"
      size="lg"
      footer={
        tech ? (
          <>
            <Button variant="ghost" onClick={onClose}>Close</Button>
            <Button onClick={() => { onClose(); navigate('/mao/incidents') }}>Open incident reports</Button>
          </>
        ) : undefined
      }
    >
      {tech && status && (
        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-2xl">
            <img src={COVER_IMAGES[tech.id % COVER_IMAGES.length]} alt="" className="h-28 w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/80 via-forest/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 p-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/15 text-lg font-semibold text-white ring-2 ring-white/30">
                {tech.avatar_url ? (
                  <img src={tech.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  nameInitials(tech.full_name, tech.first_name, tech.last_name)
                )}
              </div>
              <div className="min-w-0 text-white">
                <p className="truncate text-lg font-semibold">{tech.full_name}</p>
                <p className="text-sm text-white/85">{specializationLabel(tech.specializations)}</p>
              </div>
              <span className={cn('ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold', status.className)}>
                <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
                {status.label}
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <a href={`mailto:${tech.email}`} className="rounded-2xl border border-black/[0.04] bg-canvas p-4 transition-colors hover:border-forest-light/40">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Mail className="h-3.5 w-3.5 text-forest" /> Email
              </p>
              <p className="mt-2 break-all text-sm font-medium text-ink">{tech.email || '—'}</p>
            </a>
            <a href={`tel:${tech.phone}`} className="rounded-2xl border border-black/[0.04] bg-canvas p-4 transition-colors hover:border-forest-light/40">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Phone className="h-3.5 w-3.5 text-forest" /> Phone
              </p>
              <p className="mt-2 text-sm font-medium text-ink">{tech.phone || '—'}</p>
            </a>
            <div className="rounded-2xl border border-black/[0.04] bg-canvas p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-forest" /> Location
              </p>
              <p className="mt-2 text-sm font-medium text-ink">
                {tech.barangay?.name ?? '—'}
                {tech.municipality?.name ? ` · ${tech.municipality.name}` : ''}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-black/[0.04] bg-canvas p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Assigned cases</p>
              <p className="mt-2 text-2xl font-bold text-ink">{tech.assigned_cases ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-black/[0.04] bg-canvas p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Workload</p>
              <p className="mt-2 text-2xl font-bold text-ink">{tech.workload ?? 0}%</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-forest/10">
                <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${tech.workload ?? 0}%` }} />
              </div>
            </div>
            <div className="rounded-2xl border border-black/[0.04] bg-canvas p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5 text-forest" /> Experience
              </p>
              <p className="mt-2 text-sm font-medium text-ink">
                {tech.years_experience ? `${tech.years_experience} year${tech.years_experience === 1 ? '' : 's'}` : '—'}
              </p>
              {tech.license_number && (
                <p className="mt-1 text-xs text-muted-foreground">{tech.license_number}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
