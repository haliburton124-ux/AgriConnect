import '@/lib/chartSetup'
import { useEffect, useState } from 'react'
import { Line, Doughnut } from 'react-chartjs-2'
import { AlertTriangle, CheckCircle2, Clock, FileWarning, Map as MapIcon, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/shared/KpiCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { dashboardService, type DashboardData } from '@/services/dashboardService'
import { useAuthStore } from '@/store/authStore'
import { formatDate } from '@/lib/utils'

export function DashboardPage() {
  const { user } = useAuthStore()
  const role = user!.role
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    dashboardService.fetch(role).then((res) => setData(res.data.data))
  }, [role])

  const isProvinceWide = role === 'provincial_office' || role === 'admin'

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-28 w-full rounded-2xl" />)}
        </div>
        <div className="skeleton h-80 w-full rounded-2xl" />
      </div>
    )
  }

  const { kpis, trends, category_breakdown, recent_incidents, municipality_comparison } = data

  const trendChart = {
    labels: trends.map((t) => t.period),
    datasets: [
      {
        label: 'Incidents',
        data: trends.map((t) => t.total),
        borderColor: '#2E7D32',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#2E7D32',
      },
    ],
  }

  const categoryChart = {
    labels: category_breakdown.map((c) => c.category),
    datasets: [
      {
        data: category_breakdown.map((c) => c.total),
        backgroundColor: category_breakdown.map((c) => c.color),
        borderWidth: 0,
      },
    ],
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">
          {isProvinceWide ? 'Province-Wide Dashboard' : 'Municipal Dashboard'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isProvinceWide ? 'Incident activity across all of Ilocos Norte.' : 'Incident activity in your municipality.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Today's Reports" value={kpis.today} icon={Clock} tone="sky" delay={0} />
        <KpiCard label="Pending" value={kpis.pending} icon={FileWarning} tone="gold" delay={0.05} />
        <KpiCard label="Resolved" value={kpis.resolved} icon={CheckCircle2} tone="success" delay={0.1} />
        <KpiCard label="Critical & Open" value={kpis.critical_open} icon={AlertTriangle} tone="danger" delay={0.15} />
      </div>

      {isProvinceWide && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard label="Municipalities" value={kpis.total_municipalities ?? 0} icon={MapIcon} tone="primary" delay={0.2} />
          <KpiCard label="Registered Farmers" value={kpis.total_farmers ?? 0} icon={Users} tone="primary" delay={0.25} />
          <KpiCard label="Technicians" value={kpis.total_technicians ?? 0} icon={Users} tone="primary" delay={0.3} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Incident Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {trends.length === 0 ? (
              <EmptyState icon={Clock} title="No trend data yet" description="Once incidents start coming in, you'll see the trend here." />
            ) : (
              <Line data={trendChart} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By Category</CardTitle>
          </CardHeader>
          <CardContent>
            {category_breakdown.length === 0 ? (
              <EmptyState icon={FileWarning} title="No data yet" description="Category breakdown appears once incidents are reported." />
            ) : (
              <Doughnut data={categoryChart} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } } }} />
            )}
          </CardContent>
        </Card>
      </div>

      {isProvinceWide && municipality_comparison && (
        <Card>
          <CardHeader>
            <CardTitle>Municipality Comparison</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Municipality</th>
                    <th className="px-5 py-3 font-medium">Total</th>
                    <th className="px-5 py-3 font-medium">Pending</th>
                    <th className="px-5 py-3 font-medium">Resolved</th>
                    <th className="px-5 py-3 font-medium">Critical</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {municipality_comparison.map((m) => (
                    <tr key={m.id} className="hover:bg-forest/[0.02]">
                      <td className="px-5 py-3 font-medium text-ink">{m.name}</td>
                      <td className="px-5 py-3 text-ink/80">{m.total_incidents}</td>
                      <td className="px-5 py-3 text-ink/80">{m.pending_incidents}</td>
                      <td className="px-5 py-3 text-ink/80">{m.resolved_incidents}</td>
                      <td className="px-5 py-3 text-ink/80">{m.critical_incidents}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recent_incidents.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={FileWarning} title="No incidents yet" description="Recent reports will show up here." />
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {recent_incidents.map((incident) => (
                <div key={incident.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{incident.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {incident.reference_code} · {incident.farmer?.full_name ?? '—'} · {formatDate(incident.incident_date)}
                      {isProvinceWide && incident.municipality ? ` · ${incident.municipality.name}` : ''}
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
