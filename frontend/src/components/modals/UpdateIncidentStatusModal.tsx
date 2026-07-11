import { useState } from 'react'
import { toast } from 'sonner'
import { PlayCircle, CheckCircle2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { incidentService } from '@/services/incidentService'
import { getApiErrorMessage } from '@/lib/api'
import type { Incident } from '@/types'

interface UpdateIncidentStatusModalProps {
  open: boolean
  onClose: () => void
  incident: Incident | null
  onSuccess: () => void
}

/**
 * Moves an assigned incident forward one step: 'assigned' → 'ongoing'
 * ("Start Inspection") or 'ongoing' → 'resolved' ("Mark Resolved"). The
 * target status is derived from the incident's current status so callers
 * never need to know the state machine — they just open this modal.
 */
export function UpdateIncidentStatusModal({ open, onClose, incident, onSuccess }: UpdateIncidentStatusModalProps) {
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const targetStatus: 'ongoing' | 'resolved' = incident?.status === 'ongoing' ? 'resolved' : 'ongoing'
  const isResolving = targetStatus === 'resolved'

  const handleConfirm = async () => {
    if (!incident) return
    setSubmitting(true)
    try {
      await incidentService.updateStatus(incident.id, targetStatus, notes || undefined)
      toast.success(`${incident.reference_code} marked as ${targetStatus}.`)
      onSuccess()
      onClose()
      setNotes('')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isResolving ? 'Mark as Resolved' : 'Start Inspection'}
      description={incident ? `${incident.reference_code} — ${incident.title}` : undefined}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} loading={submitting}>
            {isResolving ? <CheckCircle2 className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
            {isResolving ? 'Mark as Resolved' : 'Mark as Ongoing'}
          </Button>
        </>
      }
    >
      <p className="text-sm text-ink/80">
        {isResolving
          ? 'Confirm the issue has been addressed. The farmer will be notified immediately.'
          : 'This lets the farmer know you\u2019ve begun working on their report.'}
      </p>
      <label className="mt-4 block text-sm font-medium text-ink">Notes (optional)</label>
      <textarea
        className="mt-1.5 w-full rounded-xl border-2 border-input bg-white px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:border-forest-light"
        rows={3}
        placeholder="Any notes for the record…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
    </Modal>
  )
}
