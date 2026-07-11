import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Plus, Search, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ReportIncidentModal } from '@/components/modals/ReportIncidentModal'
import { IncidentDetailModal } from '@/components/modals/IncidentDetailModal'
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

export function FarmerIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[] | null>(null)
  const [status, setStatus] = useState<string>('')
  const [search, setSearch] = useState('')
  const [reportOpen, setReportOpen] = useState(false)
  const [selected, setSelected] = useState<Incident | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  const load = () => {
    setIncidents(null)
    incidentService.listMine({ status: status || undefined, search: search || undefined }).then((res) => {
      setIncidents(res.data.data)
    })
  }

  useEffect(load, [status, search])

  const openDetail = async (incident: Incident) => {
    setSelected(incident)
    setDetailOpen(true)
    setDetailLoading(true)
    try {
      const { data } = await incidentService.getMine(incident.id)
      setSelected(data.data)
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">My Incident Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track every report you've submitted, from pending to resolved.</p>
        </div>
        <Button onClick={() => setReportOpen(true)}>
          <Plus className="h-4 w-4" /> Report Incident
        </Button>
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
              <EmptyState
                icon={AlertTriangle}
                title="No incidents found"
                description="Try a different filter, or report a new incident if you're seeing a problem on your farm."
                actionLabel="Report Incident"
                onAction={() => setReportOpen(true)}
              />
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {incidents.map((incident, i) => (
                <motion.button
                  key={incident.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => openDetail(incident)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-forest/[0.02]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${incident.category?.color ?? '#2E7D32'}15` }}
                    >
                      <MapPin className="h-5 w-5" style={{ color: incident.category?.color ?? '#2E7D32' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{incident.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {incident.reference_code} · {formatDate(incident.incident_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={incident.severity}>{incident.severity}</Badge>
                    <Badge variant={incident.status}>{incident.status}</Badge>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ReportIncidentModal open={reportOpen} onClose={() => setReportOpen(false)} onSuccess={load} />

      <IncidentDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        incident={selected}
        loading={detailLoading}
      />
    </div>
  )
}
