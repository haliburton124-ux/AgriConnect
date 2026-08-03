import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  History, Search, Download, ChevronDown, ChevronLeft, ChevronRight,
  Filter, RefreshCw, Shield, User as UserIcon, MapPin, Layers,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { auditLogService, type AuditLogEntry, type AuditLogFilters } from '@/services/auditLogService'
import { api } from '@/lib/api'
import { getApiErrorMessage } from '@/lib/api'
import { cn, formatDateTime } from '@/lib/utils'
import type { UserRole } from '@/types'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  provincial_office: 'Provincial Office',
  municipal_office: 'Municipal Office',
  technician: 'Technician',
  farmer: 'Farmer',
}

function actionTone(action: string): 'resolved' | 'pending' | 'rejected' | 'neutral' {
  if (action.includes('archived') || action.includes('deleted') || action.includes('rejected')) return 'rejected'
  if (action.includes('created') || action.includes('registered') || action.includes('restored')) return 'resolved'
  if (action.includes('login') || action.includes('assigned') || action.includes('status')) return 'pending'
  return 'neutral'
}

export function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 25 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(true)
  const [exporting, setExporting] = useState(false)

  const [filterOptions, setFilterOptions] = useState<{ modules: string[]; roles: UserRole[] }>({
    modules: [],
    roles: [],
  })
  const [municipalities, setMunicipalities] = useState<{ id: number; name: string }[]>([])

  const [filters, setFilters] = useState<AuditLogFilters>({
    search: '',
    module: '',
    user_role: '',
    municipality_id: undefined,
    date_from: '',
    date_to: '',
    page: 1,
    per_page: 25,
  })

  useEffect(() => {
    auditLogService.filters().then((res) => setFilterOptions(res.data.data)).catch(() => {})
    api.get<{ data: { id: number; name: string }[] }>('/locations/municipalities')
      .then((res) => setMunicipalities(res.data.data))
      .catch(() => {})
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await auditLogService.list(filters)
      setLogs(res.data.data)
      setMeta({ ...res.data.meta, per_page: filters.per_page ?? 25 })
    } catch (err) {
      setError(getApiErrorMessage(err))
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    const timer = setTimeout(() => load(), filters.search ? 350 : 0)
    return () => clearTimeout(timer)
  }, [
    filters.search,
    filters.module,
    filters.user_role,
    filters.municipality_id,
    filters.date_from,
    filters.date_to,
    filters.page,
    filters.per_page,
    load,
  ])

  const updateFilter = <K extends keyof AuditLogFilters>(key: K, value: AuditLogFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: key === 'page' ? (value as number) : 1 }))
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      await auditLogService.exportCsv(filters)
      toast.success('Audit log export downloaded.')
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setExporting(false)
    }
  }

  const hasActiveFilters = Boolean(
    filters.search || filters.module || filters.user_role || filters.municipality_id || filters.date_from || filters.date_to,
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink via-ink to-forest p-6 text-white shadow-glass sm:p-8">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <Shield className="h-3.5 w-3.5" /> Platform accountability
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl">Audit Logs</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/75">
              A complete trail of sign-ins, registrations, incident workflows, content management, archives, and administrative actions across AgriConnect.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={load} disabled={loading}>
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
            </Button>
            <Button className="bg-white text-ink hover:bg-white/90" onClick={handleExport} loading={exporting}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search action, module, or description…"
                className="pl-9"
                value={filters.search ?? ''}
                onChange={(e) => updateFilter('search', e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters((v) => !v)}>
              <Filter className="h-4 w-4" /> {showFilters ? 'Hide filters' : 'Show filters'}
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 gap-3 rounded-xl border border-black/5 bg-forest/[0.02] p-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Module</label>
                <select
                  className="h-11 w-full rounded-xl border-2 border-input bg-white px-3 text-sm"
                  value={filters.module ?? ''}
                  onChange={(e) => updateFilter('module', e.target.value)}
                >
                  <option value="">All modules</option>
                  {filterOptions.modules.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role</label>
                <select
                  className="h-11 w-full rounded-xl border-2 border-input bg-white px-3 text-sm"
                  value={filters.user_role ?? ''}
                  onChange={(e) => updateFilter('user_role', e.target.value as UserRole | '')}
                >
                  <option value="">All roles</option>
                  {filterOptions.roles.map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Municipality</label>
                <select
                  className="h-11 w-full rounded-xl border-2 border-input bg-white px-3 text-sm"
                  value={filters.municipality_id ?? ''}
                  onChange={(e) => updateFilter('municipality_id', e.target.value ? Number(e.target.value) : undefined)}
                >
                  <option value="">All municipalities</option>
                  {municipalities.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">From</label>
                <Input type="date" value={filters.date_from ?? ''} onChange={(e) => updateFilter('date_from', e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">To</label>
                <Input type="date" value={filters.date_to ?? ''} onChange={(e) => updateFilter('date_to', e.target.value)} />
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{meta.total} matching records</span>
              <button
                type="button"
                className="font-semibold text-forest hover:underline"
                onClick={() => setFilters({ search: '', module: '', user_role: '', municipality_id: undefined, date_from: '', date_to: '', page: 1, per_page: 25 })}
              >
                Clear filters
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-16 w-full rounded-xl" />)}
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-sm text-danger">{error}</p>
              <Button className="mt-4" variant="outline" onClick={load}>Try again</Button>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={History}
                title="No audit records found"
                description={hasActiveFilters
                  ? 'No entries match your current filters. Try adjusting the date range or search terms.'
                  : 'Activity across the platform will appear here automatically as users sign in, register farms, report incidents, and manage content.'}
              />
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-black/5 bg-forest/[0.03] text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-5 py-3 font-medium">Timestamp</th>
                      <th className="px-5 py-3 font-medium">User</th>
                      <th className="px-5 py-3 font-medium">Module</th>
                      <th className="px-5 py-3 font-medium">Action</th>
                      <th className="px-5 py-3 font-medium">Description</th>
                      <th className="px-5 py-3 font-medium">Record</th>
                      <th className="px-5 py-3 font-medium">IP</th>
                      <th className="px-5 py-3 font-medium" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {logs.map((log) => (
                      <AuditRow key={log.id} log={log} expanded={expandedId === log.id} onToggle={() => setExpandedId(expandedId === log.id ? null : log.id)} />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-black/5 lg:hidden">
                {logs.map((log) => (
                  <MobileAuditRow key={log.id} log={log} expanded={expandedId === log.id} onToggle={() => setExpandedId(expandedId === log.id ? null : log.id)} />
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {!loading && !error && meta.last_page > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Page {meta.current_page} of {meta.last_page} · {meta.total} total entries
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.current_page <= 1}
              onClick={() => updateFilter('page', meta.current_page - 1)}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => updateFilter('page', meta.current_page + 1)}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function AuditRow({
  log,
  expanded,
  onToggle,
}: {
  log: AuditLogEntry
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <>
      <tr className="transition-colors hover:bg-forest/[0.02]">
        <td className="px-5 py-3.5 whitespace-nowrap text-ink/70">{formatDateTime(log.created_at)}</td>
        <td className="px-5 py-3.5">
          <p className="font-medium text-ink">{log.user?.full_name ?? 'System'}</p>
          <p className="text-xs capitalize text-muted-foreground">{ROLE_LABELS[log.user_role ?? ''] ?? log.user_role ?? '—'}</p>
        </td>
        <td className="px-5 py-3.5">
          <span className="inline-flex items-center gap-1 text-ink/80">
            <Layers className="h-3.5 w-3.5 text-forest" />
            {log.module ?? '—'}
          </span>
        </td>
        <td className="px-5 py-3.5">
          <Badge variant={actionTone(log.action)}>{log.action}</Badge>
        </td>
        <td className="max-w-xs px-5 py-3.5 text-ink/70">{log.description ?? '—'}</td>
        <td className="px-5 py-3.5 text-ink/60">{log.auditable_id ? `#${log.auditable_id}` : '—'}</td>
        <td className="px-5 py-3.5 text-xs text-muted-foreground">{log.ip_address ?? '—'}</td>
        <td className="px-5 py-3.5">
          {(log.old_values || log.new_values) && (
            <button type="button" onClick={onToggle} className="rounded-lg p-1.5 text-muted-foreground hover:bg-forest/5">
              <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
            </button>
          )}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-ink/[0.02]">
          <td colSpan={8} className="px-5 py-4">
            <ChangeDetails log={log} />
          </td>
        </tr>
      )}
    </>
  )
}

function MobileAuditRow({
  log,
  expanded,
  onToggle,
}: {
  log: AuditLogEntry
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant={actionTone(log.action)}>{log.action}</Badge>
            <span className="text-xs text-muted-foreground">{formatDateTime(log.created_at)}</span>
          </div>
          <p className="font-medium text-ink">{log.description ?? log.action}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><UserIcon className="h-3 w-3" />{log.user?.full_name ?? 'System'}</span>
            <span className="inline-flex items-center gap-1"><Layers className="h-3 w-3" />{log.module ?? '—'}</span>
            {log.municipality && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{log.municipality.name}</span>}
          </div>
        </div>
        {(log.old_values || log.new_values) && (
          <button type="button" onClick={onToggle} className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-forest/5">
            <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
          </button>
        )}
      </div>
      {expanded && <div className="mt-4"><ChangeDetails log={log} /></div>}
    </div>
  )
}

function ChangeDetails({ log }: { log: AuditLogEntry }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Before</p>
        <pre className="overflow-x-auto rounded-xl bg-white p-3 text-[11px] text-ink/70 shadow-card">
          {JSON.stringify(log.old_values, null, 2) ?? '—'}
        </pre>
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">After</p>
        <pre className="overflow-x-auto rounded-xl bg-white p-3 text-[11px] text-ink/70 shadow-card">
          {JSON.stringify(log.new_values, null, 2) ?? '—'}
        </pre>
      </div>
    </div>
  )
}
