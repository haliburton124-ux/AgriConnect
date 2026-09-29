import { useEffect, useState } from 'react'
import { CheckCircle2, ClipboardList, PlayCircle, Search } from 'lucide-react'
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
        <p className="mt-1 text-sm text-muted-foreground">Cases assigned to you for inspection.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
                status === tab.value ? 'bg-forest text-white' : 'bg-white text-ink/60 hover:bg-forest/5',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {incidents === null ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 w-full" />)}
            </div>
          ) : incidents.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={ClipboardList} title="No assigned incidents" description="Cases assigned to you will appear here." />
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {incidents.map((incident) => (
                <div key={incident.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <button type="button" onClick={() => openDetail(incident)} className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-medium text-ink">{incident.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {incident.reference_code}
                      {incident.farmer?.full_name ? ` · ${incident.farmer.full_name}` : ''}
                      {` · ${formatDate(incident.incident_date)}`}
                    </p>
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
                      <Button size="sm" variant="outline" onClick={() => { setSelected(incident); setActiveModal('recommendation') }}>
                        <CheckCircle2 className="h-4 w-4" /> Resolve
                      </Button>
                    )}
                  </div>
                </div>
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
