import '@/lib/chartSetup'
import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { Map, Eye, Users, Wrench, Home, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { KpiCard } from '@/components/shared/KpiCard'
import { ppoMunicipalityService, type MunicipalityDetail } from '@/services/ppoMunicipalityService'
import type { MunicipalityComparisonRow } from '@/services/dashboardService'
import { formatDate } from '@/lib/utils'

export function PpoMunicipalitiesPage() {
  const [rows, setRows] = useState<MunicipalityComparisonRow[] | null>(null)
  const [detail, setDetail] = useState<MunicipalityDetail | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    ppoMunicipalityService.list().then((res) => setRows(res.data.data))
  }, [])

  const openDetail = async (id: number) => {
    setDetailOpen(true)
    setDetailLoading(true)
    try {
      const res = await ppoMunicipalityService.get(id)
      setDetail(res.data.data)
    } finally {
      setDetailLoading(false)
    }
  }

  const trendChart = detail ? {
    labels: detail.trends.map((t) => t.period),
    datasets: [{
      label: 'Incidents',
      data: detail.trends.map((t) => t.total),
      borderColor: '#2E7D32',
      backgroundColor: 'rgba(46, 125, 50, 0.1)',
      tension: 0.35,
      fill: true,
    }],
  } : null

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Municipalities</h1>
        <p className="mt-1 text-sm text-muted-foreground">Compare incident activity across every municipality in Ilocos Norte.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {rows === null ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-14 w-full" />)}
            </div>
          ) : rows.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={Map} title="No data available" description="Municipality comparison data will appear here once incidents are reported." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Municipality</th>
                    <th className="px-5 py-3 font-medium">Total</th>
                    <th className="px-5 py-3 font-medium">Pending</th>
                    <th className="px-5 py-3 font-medium">Resolved</th>
                    <th className="px-5 py-3 font-medium">Critical</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {rows.map((row) => (
                    <tr key={row.id} className="transition-colors hover:bg-forest/[0.02]">
                      <td className="px-5 py-3.5 font-medium text-ink">{row.name}</td>
                      <td className="px-5 py-3.5 text-ink/80">{row.total_incidents}</td>
                      <td className="px-5 py-3.5 text-ink/80">{row.pending_incidents}</td>
                      <td className="px-5 py-3.5 text-ink/80">{row.resolved_incidents}</td>
                      <td className="px-5 py-3.5 text-ink/80">{row.critical_incidents}</td>
                      <td className="px-5 py-3.5 text-right">
                        <Button size="icon" variant="ghost" title="View details" onClick={() => openDetail(row.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={detail?.municipality.name ?? 'Municipality Details'} size="lg">
        {detailLoading || !detail ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 w-full" />)}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <KpiCard label="Pending" value={detail.kpis.pending} icon={AlertTriangle} tone="gold" delay={0} />
              <KpiCard label="Resolved" value={detail.kpis.resolved} icon={CheckCircle2} tone="success" delay={0.05} />
              <KpiCard label="Farmers" value={detail.staff_counts.farmers} icon={Users} tone="primary" delay={0.1} />
              <KpiCard label="Technicians" value={detail.staff_counts.technicians} icon={Wrench} tone="sky" delay={0.15} />
            </div>

            <div className="flex items-center gap-1.5 text-sm text-ink/70">
              <Home className="h-4 w-4 text-forest" /> {detail.barangay_count} barangays
            </div>

            {trendChart && detail.trends.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-ink">Incident Trend</h4>
                <Line data={trendChart} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
              </div>
            )}

            <div>
              <h4 className="mb-2 text-sm font-semibold text-ink">Recent Incidents</h4>
              {detail.recent_incidents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No incidents reported yet.</p>
              ) : (
                <div className="space-y-2">
                  {detail.recent_incidents.map((incident) => (
                    <div key={incident.id} className="flex items-center justify-between rounded-lg bg-forest/[0.03] px-3 py-2 text-sm">
                      <div>
                        <p className="text-ink/80">{incident.title}</p>
                        <p className="text-xs text-muted-foreground">{incident.reference_code} · {formatDate(incident.incident_date)}</p>
                      </div>
                      <Badge variant={incident.status}>{incident.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
