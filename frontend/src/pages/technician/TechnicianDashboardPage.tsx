import { useEffect, useState } from 'react'
import { ClipboardList, PlayCircle, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/shared/KpiCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { incidentService } from '@/services/incidentService'
import { formatDate } from '@/lib/utils'
import type { Incident } from '@/types'

/**
 * Technician has no dedicated dashboard endpoint on the backend — this
 * page computes its KPIs client-side from the same `/technician/incidents`
 * list the Assigned Incidents screen already uses, avoiding a redundant
 * backend endpoint for what's a fairly small, single-user data set.
 */
export function TechnicianDashboardPage() {
  const [incidents, setIncidents] = useState<Incident[] | null>(null)

  useEffect(() => {
    incidentService.listAssigned({ page: 1 }).then((res) => setIncidents(res.data.data))
  }, [])

  if (!incidents) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-28 w-full rounded-2xl" />)}
        </div>
        <div className="skeleton h-64 w-full rounded-2xl" />
      </div>
    )
  }

  const assigned = incidents.filter((i) => i.status === 'assigned').length
  const ongoing = incidents.filter((i) => i.status === 'ongoing').length
  const resolved = incidents.filter((i) => i.status === 'resolved').length
  const critical = incidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length
  const activeIncidents = incidents.filter((i) => i.status === 'assigned' || i.status === 'ongoing')

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">My Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your current workload at a glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Awaiting Inspection" value={assigned} icon={ClipboardList} tone="gold" delay={0} />
        <KpiCard label="Ongoing" value={ongoing} icon={PlayCircle} tone="sky" delay={0.05} />
        <KpiCard label="Resolved" value={resolved} icon={CheckCircle2} tone="success" delay={0.1} />
        <KpiCard label="Critical & Open" value={critical} icon={AlertTriangle} tone="danger" delay={0.15} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Incidents</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {activeIncidents.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={ClipboardList} title="Nothing active right now" description="Incidents assigned to you that need action will show up here." />
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {activeIncidents.map((incident) => (
                <div key={incident.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{incident.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {incident.reference_code} · {incident.farmer?.full_name} · {formatDate(incident.incident_date)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={incident.severity}>{incident.severity}</Badge>
                    <Badge variant={incident.status}>{incident.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
