import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, Search, PlayCircle, CheckCircle2, ClipboardCheck, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Assigned Incidents</h1>
        <p className="mt-1 text-sm text-muted-foreground">Cases assigned to you for inspection and treatment recommendation.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
                status === tab.value ? 'bg-gradient-primary text-white shadow-card' : 'bg-white text-ink/60 hover:bg-forest/5 border border-black/5',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search reference or title…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {incidents === null ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-16 w-full" />)}
            </div>
          ) : incidents.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={ClipboardList} title="No assigned incidents" description="Cases assigned to you by your Municipal Agriculture Office will appear here." />
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {incidents.map((incident, i) => (
                <motion.div
                  key={incident.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <button onClick={() => openDetail(incident)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${incident.category?.color ?? '#2E7D32'}15` }}
                    >
                      <MapPin className="h-5 w-5" style={{ color: incident.category?.color ?? '#2E7D32' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{incident.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {incident.reference_code} · {incident.farmer?.full_name} · {formatDate(incident.incident_date)}
                      </p>
                    </div>
                  </button>

                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={incident.severity}>{incident.severity}</Badge>
                    <Badge variant={incident.status}>{incident.status}</Badge>

                    {incident.status === 'assigned' && (
                      <Button size="sm" variant="outline" onClick={() => { setSelected(incident); setActiveModal('status') }}>
                        <PlayCircle className="h-4 w-4" /> Start
                      </Button>
                    )}
                    {incident.status === 'ongoing' && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => { setSelected(incident); setActiveModal('recommendation') }}>
                          <ClipboardCheck className="h-4 w-4" /> Recommend
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setSelected(incident); setActiveModal('status') }}>
                          <CheckCircle2 className="h-4 w-4" /> Resolve
                        </Button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <IncidentDetailModal
        open={activeModal === 'detail'}
        onClose={() => setActiveModal(null)}
        incident={selected}
        loading={detailLoading}
        footer={
          selected && selected.status !== 'resolved' ? (
            <>
              {selected.status === 'ongoing' && (
                <Button variant="ghost" onClick={() => setActiveModal('recommendation')}>
                  <ClipboardCheck className="h-4 w-4" /> Add Recommendation
                </Button>
              )}
              <Button onClick={() => setActiveModal('status')}>
                {selected.status === 'assigned' ? <PlayCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                {selected.status === 'assigned' ? 'Start Inspection' : 'Mark Resolved'}
              </Button>
            </>
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
