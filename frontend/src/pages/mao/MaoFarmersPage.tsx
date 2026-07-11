import { useEffect, useState } from 'react'
import { Users, Search, Eye, MapPin, Sprout, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { maoFarmerService, type FarmerDirectoryEntry } from '@/services/maoFarmerService'
import { formatDate } from '@/lib/utils'
import type { IncidentStatus } from '@/types'

interface FarmerDetail {
  id: number
  full_name: string
  email: string
  phone: string
  barangay: { id: number; name: string } | null
  farms: { id: number; farm_name: string; farm_type: string; area_hectares: number | null }[]
  recent_incidents: { id: number; reference_code: string; title: string; status: IncidentStatus; severity: string; category: string | null; incident_date: string }[]
}

export function MaoFarmersPage() {
  const [farmers, setFarmers] = useState<FarmerDirectoryEntry[] | null>(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<FarmerDetail | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    setFarmers(null)
    maoFarmerService.list({ search: search || undefined }).then((res) => setFarmers(res.data.data))
  }, [search])

  const openDetail = async (farmer: FarmerDirectoryEntry) => {
    setDetailOpen(true)
    setDetailLoading(true)
    try {
      const res = await maoFarmerService.get(farmer.id)
      setSelected((res.data as { data: FarmerDetail }).data)
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Farmers</h1>
        <p className="mt-1 text-sm text-muted-foreground">Farmers registered in your municipality.</p>
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search name, email, or phone…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          {farmers === null ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-16 w-full" />)}
            </div>
          ) : farmers.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={Users} title="No farmers found" description="Try a different search term." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Barangay</th>
                    <th className="px-5 py-3 font-medium">Farms</th>
                    <th className="px-5 py-3 font-medium">Reports</th>
                    <th className="px-5 py-3 font-medium">Joined</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {farmers.map((farmer) => (
                    <tr key={farmer.id} className="transition-colors hover:bg-forest/[0.02]">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-ink">{farmer.full_name}</p>
                        <p className="text-xs text-muted-foreground">{farmer.email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-ink/80">{farmer.barangay?.name ?? '—'}</td>
                      <td className="px-5 py-3.5 text-ink/80">{farmer.farm_count}</td>
                      <td className="px-5 py-3.5 text-ink/80">{farmer.incident_count}</td>
                      <td className="px-5 py-3.5 text-ink/60">{formatDate(farmer.created_at)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <Button size="icon" variant="ghost" title="View details" onClick={() => openDetail(farmer)}>
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

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={selected?.full_name ?? 'Farmer Details'} size="lg">
        {detailLoading || !selected ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 w-full" />)}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium text-ink">{selected.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium text-ink">{selected.phone}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Barangay</p>
                <p className="font-medium text-ink">{selected.barangay?.name ?? '—'}</p>
              </div>
            </div>

            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
                <Sprout className="h-4 w-4" /> Farms ({selected.farms.length})
              </h4>
              {selected.farms.length === 0 ? (
                <p className="text-sm text-muted-foreground">No farms registered.</p>
              ) : (
                <div className="space-y-2">
                  {selected.farms.map((farm) => (
                    <div key={farm.id} className="flex items-center justify-between rounded-lg bg-forest/[0.03] px-3 py-2 text-sm">
                      <span className="flex items-center gap-1.5 text-ink/80"><MapPin className="h-3.5 w-3.5" /> {farm.farm_name}</span>
                      <span className="text-xs capitalize text-muted-foreground">{farm.farm_type}{farm.area_hectares ? ` · ${farm.area_hectares} ha` : ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
                <AlertTriangle className="h-4 w-4" /> Recent Reports
              </h4>
              {selected.recent_incidents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No incident reports yet.</p>
              ) : (
                <div className="space-y-2">
                  {selected.recent_incidents.map((incident) => (
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
