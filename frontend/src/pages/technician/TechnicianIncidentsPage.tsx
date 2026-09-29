import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle2, ClipboardList, MapPin, PlayCircle, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { IncidentDetailModal } from '@/components/modals/IncidentDetailModal'
import { UpdateIncidentStatusModal } from '@/components/modals/UpdateIncidentStatusModal'
import { AddRecommendationModal } from '@/components/modals/AddRecommendationModal'
import { incidentService } from '@/services/incidentService'
import { formatDate, cn } from '@/lib/utils'
import type { Incident } from '@/types'

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'resolved', label: 'Resolved' },
] as const

type ActiveModal = 'detail' | 'status' | 'recommendation' | null

export function TechnicianIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[] | null>(null)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Incident | null>(null)
  const [activeModal, setActiveModal] = useState<ActiveModal>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const load = () => {
    setIncidents(null)
    incidentService.listAssigned({ status: status || undefined, search: search || undefined }).then((res) => {
      setIncidents(res.data.data)
    })
  }

  useEffect(load, [status, search])

  const counts = useMemo(() => {
    const items = incidents ?? []
    return {
      all: items.length,
      assigned: items.filter((item) => item.status === 'assigned').length,
      ongoing: items.filter((item) => item.status === 'ongoing').length,
      resolved: items.filter((item) => item.status === 'resolved').length,
    }
  }, [incidents])

  const openDetail = async (incident: Incident) => {
    setSelected(incident)
    setActiveModal('detail')
    setDetailLoading(true)
    try {
      const { data } = await incidentService.getAssigned(incident.id)
      setSelected(data.data)
    } finally {
      setDetailLoading(false)
    }
  }

  const tabCount = (value: string) => {
    if (!incidents || status) return null
    if (value === '') return counts.all
    if (value === 'assigned') return counts.assigned
    if (value === 'ongoing') return counts.ongoing
    if (value === 'resolved') return counts.resolved
    return null
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="overflow-hidden rounded-[22px] bg-gradient-to-br from-forest-dark via-forest to-forest-light p-6 text-white shadow-card sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Field cases</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Assigned Incidents</h1>
        <p className="mt-2 max-w-xl text-sm text-white/85">
          Inspect farms, start visits, and file treatment recommendations for cases assigned to you.
        </p>
        {incidents && !status && !search && (
          <div className="mt-5 grid grid-cols-3 gap-3 max-w-md">
            {[
              { label: 'To start', value: counts.assigned },
              { label: 'On site', value: counts.ongoing },
              { label: 'Resolved', value: counts.resolved },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white/12 px-3 py-2.5 backdrop-blur-sm">
                <p className="text-lg font-semibold leading-none">{stat.value}</p>
                <p className="mt-1 text-[11px] font-medium text-white/75">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => {
            const count = tabCount(tab.value)
            return (
              <button
                key={tab.value}
                onClick={() => setStatus(tab.value)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
                  status === tab.value ? 'bg-gradient-primary text-white shadow-card' : 'border border-black/5 bg-white text-ink/60 hover:bg-forest/5',
                )}
              >
                {tab.label}
                {count != null && (
                  <span className={cn('rounded-full px-1.5 py-px text-[10px]', status === tab.value ? 'bg-white/20' : 'bg-muted text-muted-foreground')}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference or title…"
            className="h-11 w-full rounded-full border border-black/10 bg-white pl-10 pr-4 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:border-forest-light focus-visible:outline-none"
          />
        </div>
      </div>

      {incidents === null ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-36 rounded-[22px]" />)}
        </div>
      ) : incidents.length === 0 ? (
        <div className="rounded-[22px] border border-dashed border-forest-light/40 bg-white px-6 py-12">
          <EmptyState icon={ClipboardList} title="No assigned incidents" description="Cases assigned to you by your Municipal Agriculture Office will appear here." />
        </div>
      ) : (
        <div className="grid gap-3">
          {incidents.map((incident, i) => {
            const accent = incident.category?.color ?? '#2E7D32'
            return (
              <motion.article
                key={incident.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="overflow-hidden rounded-[22px] border border-black/[0.04] bg-white shadow-soft"
              >
                <div className="flex">
                  <div className="w-1.5 shrink-0" style={{ backgroundColor: accent }} />
                  <div className="flex min-w-0 flex-1 flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <button type="button" onClick={() => openDetail(incident)} className="min-w-0 flex-1 text-left">
                      <div className="flex items-start gap-3">
                        <span
                          className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                          style={{ backgroundColor: `${accent}18`, color: accent }}
                        >
                          <MapPin className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-ink">{incident.title}</p>
                          <p className="mt-0.5 text-xs font-medium text-muted-foreground">{incident.reference_code}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink/70">
                            <span className="inline-flex items-center gap-1">
                              <User className="h-3.5 w-3.5 text-forest" />
                              {incident.farmer?.full_name ?? 'Farmer'}
                            </span>
                            {(incident.barangay?.name || incident.farm?.farm_name) && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-forest" />
                                {incident.farm?.farm_name ? `${incident.farm.farm_name}` : incident.barangay?.name}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-forest" />
                              {formatDate(incident.incident_date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>

                    <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant={incident.severity}>{incident.severity}</Badge>
                        <Badge variant={incident.status}>{incident.status}</Badge>
                      </div>
                      {incident.status === 'assigned' && (
                        <Button size="sm" onClick={() => { setSelected(incident); setActiveModal('status') }}>
                          <PlayCircle className="h-4 w-4" /> Start
                        </Button>
                      )}
                      {incident.status === 'ongoing' && (
                        <Button size="sm" onClick={() => { setSelected(incident); setActiveModal('recommendation') }}>
                          <CheckCircle2 className="h-4 w-4" /> Resolve
                        </Button>
                      )}
                      {incident.status === 'resolved' && (
                        <button type="button" onClick={() => openDetail(incident)} className="text-xs font-semibold text-forest hover:underline">
                          View report
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>
      )}

      <IncidentDetailModal
        open={activeModal === 'detail'}
        onClose={() => setActiveModal(null)}
        incident={selected}
        loading={detailLoading}
        footer={
          selected && selected.status !== 'resolved' ? (
            <Button onClick={() => setActiveModal(selected.status === 'ongoing' ? 'recommendation' : 'status')}>
              {selected.status === 'assigned' ? <PlayCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              {selected.status === 'assigned' ? 'Start Inspection' : 'Resolve'}
            </Button>
          ) : undefined
        }
      />

      <UpdateIncidentStatusModal
        open={activeModal === 'status'}
        onClose={() => setActiveModal(null)}
        incident={selected}
        onSuccess={load}
      />

      <AddRecommendationModal
        open={activeModal === 'recommendation'}
        onClose={() => setActiveModal(null)}
        incident={selected}
        onSuccess={load}
      />
    </div>
  )
}
