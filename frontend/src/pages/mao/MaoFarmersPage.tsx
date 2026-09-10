import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Users, Search, Eye, MapPin, Sprout, AlertTriangle, Mail, Phone, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { maoFarmerService, type FarmerDirectoryEntry } from '@/services/maoFarmerService'
import { getApiErrorMessage } from '@/lib/api'
import { cn, formatDate } from '@/lib/utils'
import type { IncidentSeverity, IncidentStatus } from '@/types'

interface FarmerDetail {
  id: number
  full_name: string
  email: string
  phone: string
  status?: string
  municipality?: { id: number; name: string } | null
  barangay: { id: number; name: string } | null
  farms: { id: number; farm_name: string; farm_type: string; area_hectares: number | null }[]
  recent_incidents: { id: number; reference_code: string; title: string; status: IncidentStatus; severity: string; category: string | null; incident_date: string }[]
  created_at?: string
}

function nameInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function MaoFarmersPage() {
  const [farmers, setFarmers] = useState<FarmerDirectoryEntry[] | null>(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<FarmerDetail | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    setFarmers(null)
    maoFarmerService
      .list({ search: search || undefined })
      .then((res) => {
        const payload = res.data.data
        if (Array.isArray(payload)) {
          setFarmers(payload)
          return
        }
        const nested = (payload as { data?: FarmerDirectoryEntry[] } | null)?.data
        setFarmers(Array.isArray(nested) ? nested : [])
      })
      .catch((error) => {
        setFarmers([])
        toast.error(getApiErrorMessage(error, 'Could not load farmers.'))
      })
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

  const closeDetail = () => {
    setDetailOpen(false)
    setSelected(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Farmers</h1>
        <p className="mt-1 text-sm text-muted-foreground">Farmers registered in your municipality.</p>
      </div>

      <div className="relative w-full sm:w-80">
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
                    <tr
                      key={farmer.id}
                      className="cursor-pointer transition-colors hover:bg-forest/[0.03]"
                      onClick={() => openDetail(farmer)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-white shadow-card">
                            {nameInitials(farmer.full_name)}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-ink">{farmer.full_name}</p>
                            <p className="truncate text-xs text-muted-foreground">{farmer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-ink/80">{farmer.barangay?.name ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', farmer.farm_count > 0 ? 'bg-forest/10 text-forest' : 'bg-muted text-muted-foreground')}>
                          {farmer.farm_count}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', farmer.incident_count > 0 ? 'bg-gold/15 text-gold' : 'bg-muted text-muted-foreground')}>
                          {farmer.incident_count}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-ink/60">{formatDate(farmer.created_at)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <Button size="icon" variant="ghost" title="View details" onClick={(e) => { e.stopPropagation(); openDetail(farmer) }}>
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

      <Modal
        open={detailOpen}
        onClose={closeDetail}
        title={selected?.full_name ?? 'Farmer profile'}
        description={selected ? 'Municipal Agriculture Office directory' : undefined}
        size="lg"
      >
        {detailLoading || !selected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="skeleton h-16 w-16 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-5 w-48" />
                <div className="skeleton h-4 w-32" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
            </div>
            <div className="skeleton h-28 w-full rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start gap-4 rounded-2xl bg-gradient-to-br from-forest-dark via-forest to-forest-light p-5 text-white shadow-card">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-semibold backdrop-blur-sm">
                {nameInitials(selected.full_name)}
              </span>
              <div className="min-w-0">
                <p className="text-lg font-semibold leading-tight">{selected.full_name}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-white/85">
                  <MapPin className="h-3.5 w-3.5" />
                  {selected.barangay?.name ?? 'No barangay assigned'}
                  {selected.municipality?.name ? ` · ${selected.municipality.name}` : ''}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
                    Farmer
                  </span>
                  {selected.status && (
                    <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold capitalize">
                      {selected.status}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <a
                href={`mailto:${selected.email}`}
                className="rounded-2xl border border-black/[0.04] bg-canvas p-4 transition-colors hover:border-forest-light/40 hover:bg-forest/[0.04]"
              >
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 text-forest" /> Email
                </p>
                <p className="mt-2 break-all text-sm font-medium text-ink">{selected.email}</p>
              </a>
              <a
                href={`tel:${selected.phone}`}
                className="rounded-2xl border border-black/[0.04] bg-canvas p-4 transition-colors hover:border-forest-light/40 hover:bg-forest/[0.04]"
              >
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 text-forest" /> Phone
                </p>
                <p className="mt-2 text-sm font-medium text-ink">{selected.phone}</p>
              </a>
              <div className="rounded-2xl border border-black/[0.04] bg-canvas p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-forest" /> Barangay
                </p>
                <p className="mt-2 text-sm font-medium text-ink">{selected.barangay?.name ?? '—'}</p>
              </div>
            </div>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest/10 text-forest">
                    <Sprout className="h-4 w-4" />
                  </span>
                  Farms
                </h4>
                <span className="rounded-full bg-forest/10 px-2.5 py-1 text-xs font-semibold text-forest">
                  {selected.farms.length}
                </span>
              </div>
              {selected.farms.length === 0 ? (
                <div className="flex items-start gap-3 rounded-2xl border-2 border-dashed border-forest-light/30 bg-forest/[0.03] px-4 py-5">
                  <Sprout className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
                  <div>
                    <p className="text-sm font-medium text-ink">No farms registered yet</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      This farmer has not added a farm with a map location, so they cannot submit GPS incident reports yet.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {selected.farms.map((farm) => (
                    <div key={farm.id} className="flex items-center justify-between gap-3 rounded-2xl border border-black/[0.04] bg-canvas px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest/10 text-forest">
                          <MapPin className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">{farm.farm_name}</p>
                          <p className="text-xs capitalize text-muted-foreground">{farm.farm_type.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                      {farm.area_hectares != null && (
                        <span className="shrink-0 text-xs font-semibold text-forest">{farm.area_hectares} ha</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/15 text-gold">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                  Recent reports
                </h4>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                  {selected.recent_incidents.length}
                </span>
              </div>
              {selected.recent_incidents.length === 0 ? (
                <div className="flex items-start gap-3 rounded-2xl border-2 border-dashed border-black/10 bg-muted/40 px-4 py-5">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-ink">No incident reports yet</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      When this farmer submits a report, it will appear here with status and date.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {selected.recent_incidents.map((incident) => (
                    <div key={incident.id} className="flex items-start justify-between gap-3 rounded-2xl border border-black/[0.04] bg-canvas px-4 py-3">
                      <div className="min-w-0">
                        <p className="font-medium text-ink">{incident.title}</p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                          <span>{incident.reference_code}</span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(incident.incident_date)}
                          </span>
                          {incident.category && <span>{incident.category}</span>}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <Badge variant={incident.status}>{incident.status}</Badge>
                        <Badge variant={incident.severity as IncidentSeverity}>{incident.severity}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </Modal>
    </div>
  )
}
