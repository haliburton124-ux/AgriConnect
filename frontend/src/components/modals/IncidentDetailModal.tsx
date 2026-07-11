import { MapPin, Calendar, User, Clock, Image as ImageIcon, FileText } from 'lucide-react'
import type { ReactNode } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { formatDate, formatDateTime } from '@/lib/utils'
import type { Incident } from '@/types'

interface IncidentDetailModalProps {
  open: boolean
  onClose: () => void
  incident: Incident | null
  loading?: boolean
  /** Optional role-specific action buttons (Validate/Reject/Assign, Update Status, etc.) rendered in the footer. */
  footer?: ReactNode
}

/**
 * Read-only detail view shared across every role's incident list — the
 * "Incident Details Modal" from the platform's UX requirements. Role-specific
 * actions (validate, reject, assign, update status, add recommendation) are
 * passed in as `footer` so this component stays a pure presentation layer.
 */
export function IncidentDetailModal({ open, onClose, incident, loading, footer }: IncidentDetailModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={incident ? incident.reference_code : 'Incident Details'}
      description={incident?.title}
      size="lg"
      footer={footer}
    >
      {loading || !incident ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 w-full" />)}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={incident.severity}>{incident.severity} severity</Badge>
            <Badge variant={incident.status}>{incident.status}</Badge>
            {incident.category && (
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: `${incident.category.color}15`, color: incident.category.color }}>
                {incident.category.name}
              </span>
            )}
          </div>

          <div>
            <h4 className="mb-1.5 text-sm font-semibold text-ink">Description</h4>
            <p className="text-sm leading-relaxed text-ink/80">{incident.description}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
              <div>
                <p className="text-xs text-muted-foreground">Reported by</p>
                <p className="text-sm font-medium text-ink">{incident.farmer?.full_name ?? '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
              <div>
                <p className="text-xs text-muted-foreground">Date reported</p>
                <p className="text-sm font-medium text-ink">{formatDate(incident.incident_date)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium text-ink">
                  Brgy. {incident.barangay?.name}, {incident.municipality?.name}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-sky" />
              <div>
                <p className="text-xs text-muted-foreground">Assigned technician</p>
                <p className="text-sm font-medium text-ink">{incident.assigned_technician?.full_name ?? 'Not yet assigned'}</p>
              </div>
            </div>
          </div>

          {incident.rejection_reason && (
            <div className="rounded-xl bg-danger/5 border border-danger/20 p-4">
              <p className="text-xs font-semibold text-danger">Rejection reason</p>
              <p className="mt-1 text-sm text-ink/80">{incident.rejection_reason}</p>
            </div>
          )}

          {incident.media && incident.media.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
                <ImageIcon className="h-4 w-4" /> Evidence
              </h4>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {incident.media.map((m) => (
                  <a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-black/5">
                    {m.type === 'photo' ? (
                      <img src={m.url} alt="Incident evidence" className="h-20 w-full object-cover transition-transform hover:scale-105" />
                    ) : (
                      <div className="flex h-20 w-full items-center justify-center bg-ink/5 text-xs text-muted-foreground">Video</div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          {incident.status_history && incident.status_history.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
                <Clock className="h-4 w-4" /> Status Timeline
              </h4>
              <div className="space-y-3 border-l-2 border-forest-light/30 pl-4">
                {incident.status_history.map((h) => (
                  <div key={h.id} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-forest" />
                    <p className="text-sm font-medium capitalize text-ink">{h.to_status}</p>
                    {h.notes && <p className="text-xs text-ink/70">{h.notes}</p>}
                    <p className="text-xs text-muted-foreground">
                      {h.changed_by?.full_name} · {formatDateTime(h.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {incident.recommendations && incident.recommendations.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
                <FileText className="h-4 w-4" /> Technician Recommendations
              </h4>
              <div className="space-y-3">
                {incident.recommendations.map((r) => (
                  <div key={r.id} className="rounded-xl bg-forest/[0.03] p-4">
                    <p className="text-sm font-medium text-ink">{r.treatment_recommendation}</p>
                    <p className="mt-1 text-xs text-ink/70">{r.inspection_notes}</p>
                    <p className="mt-2 text-xs text-muted-foreground">— {r.technician?.full_name}, {formatDateTime(r.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
