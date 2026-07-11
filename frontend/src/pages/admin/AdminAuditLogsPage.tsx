import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { History, ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { auditLogService, type AuditLogEntry } from '@/services/auditLogService'
import { cn, formatDateTime } from '@/lib/utils'

export function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[] | null>(null)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    setLogs(null)
    auditLogService.list({ action: search || undefined }).then((res) => setLogs(res.data.data))
  }, [search])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">Audit Logs</h1>
          <p className="mt-1 text-sm text-muted-foreground">Every create, update, and delete across the platform, automatically recorded.</p>
        </div>
        <Input placeholder="Filter by action (e.g. Incident.updated)…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-72" />
      </div>

      <Card>
        <CardContent className="p-0">
          {logs === null ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-14 w-full" />)}
            </div>
          ) : logs.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={History} title="No audit records found" description="Try a different filter." />
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {logs.map((log) => {
                const isExpanded = expandedId === log.id
                return (
                  <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                      className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-forest/[0.02]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink/5">
                          <History className="h-4 w-4 text-ink/60" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ink">{log.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {log.user ? `${log.user.full_name} (${log.user.role.replace('_', ' ')})` : 'System'} · {formatDateTime(log.created_at)}
                          </p>
                        </div>
                      </div>
                      <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-180')} />
                    </button>
                    {isExpanded && (
                      <div className="grid grid-cols-1 gap-4 bg-ink/[0.02] p-4 sm:grid-cols-2">
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Before</p>
                          <pre className="overflow-x-auto rounded-lg bg-white p-3 text-[11px] text-ink/70">{JSON.stringify(log.old_values, null, 2) ?? '—'}</pre>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">After</p>
                          <pre className="overflow-x-auto rounded-lg bg-white p-3 text-[11px] text-ink/70">{JSON.stringify(log.new_values, null, 2) ?? '—'}</pre>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
