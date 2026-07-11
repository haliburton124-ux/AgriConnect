import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, UserPlus, XCircle, Search, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { IncidentDetailModal } from '@/components/modals/IncidentDetailModal'
import { ValidateIncidentModal } from '@/components/modals/ValidateIncidentModal'
import { RejectIncidentModal } from '@/components/modals/RejectIncidentModal'
import { AssignTechnicianModal } from '@/components/modals/AssignTechnicianModal'
import { incidentService } from '@/services/incidentService'
import { formatDate, cn } from '@/lib/utils'
import type { Incident } from '@/types'

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'validated', label: 'Validated' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
] as const

type ActiveModal = 'detail' | 'validate' | 'reject' | 'assign' | null

export function MaoIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[] | null>(null)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Incident | null>(null)
  const [activeModal, setActiveModal] = useState<ActiveModal>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const load = () => {
    setIncidents(null)
    incidentService.listForMunicipality({ status: status || undefined, search: search || undefined }).then((res) => {
      setIncidents(res.data.data)
    })
  }

  useEffect(load, [status, search])

  const openDetail = async (incident: Incident) => {
    setSelected(incident)
    setActiveModal('detail')
    setDetailLoading(true)
    try {
      const { data } = await incidentService.getForMunicipality(incident.id)
      setSelected(data.data)
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Incident Monitoring</h1>
        <p className="mt-1 text-sm text-muted-foreground">Validate incoming reports and assign technicians for your municipality.</p>
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
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-16 w-full" />)}
            </div>
          ) : incidents.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={AlertTriangle} title="No incidents found" description="Nothing matches this filter right now." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Reference</th>
                    <th className="px-5 py-3 font-medium">Farmer</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium">Severity</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {incidents.map((incident) => (
                    <tr key={incident.id} className="transition-colors hover:bg-forest/[0.02]">
                      <td className="px-5 py-3.5 font-medium text-ink">{incident.reference_code}</td>
                      <td className="px-5 py-3.5 text-ink/80">{incident.farmer?.full_name ?? '—'}</td>
                      <td className="px-5 py-3.5 text-ink/80">{incident.category?.name ?? '—'}</td>
                      <td className="px-5 py-3.5"><Badge variant={incident.severity}>{incident.severity}</Badge></td>
                      <td className="px-5 py-3.5"><Badge variant={incident.status}>{incident.status}</Badge></td>
                      <td className="px-5 py-3.5 text-ink/60">{formatDate(incident.incident_date)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1.5">
                          <Button size="icon" variant="ghost" title="View details" onClick={() => openDetail(incident)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {incident.status === 'pending' && (
                            <>
                              <Button size="icon" variant="ghost" title="Validate" onClick={() => { setSelected(incident); setActiveModal('validate') }}>
                                <CheckCircle2 className="h-4 w-4 text-success" />
                              </Button>
                              <Button size="icon" variant="ghost" title="Reject" onClick={() => { setSelected(incident); setActiveModal('reject') }}>
                                <XCircle className="h-4 w-4 text-danger" />
                              </Button>
                            </>
                          )}
                          {incident.status === 'validated' && (
                            <Button size="icon" variant="ghost" title="Assign technician" onClick={() => { setSelected(incident); setActiveModal('assign') }}>
                              <UserPlus className="h-4 w-4 text-sky" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <IncidentDetailModal
        open={activeModal === 'detail'}
        onClose={() => setActiveModal(null)}
        incident={selected}
        loading={detailLoading}
      />
      <ValidateIncidentModal
        open={activeModal === 'validate'}
        onClose={() => setActiveModal(null)}
        incident={selected}
        onSuccess={load}
      />
      <RejectIncidentModal
        open={activeModal === 'reject'}
        onClose={() => setActiveModal(null)}
        incident={selected}
        onSuccess={load}
      />
      <AssignTechnicianModal
        open={activeModal === 'assign'}
        onClose={() => setActiveModal(null)}
        incident={selected}
        onSuccess={load}
      />
    </div>
  )
}
