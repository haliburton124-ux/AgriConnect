import { useState } from 'react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { incidentService } from '@/services/incidentService'
import { getApiErrorMessage } from '@/lib/api'
import type { Incident } from '@/types'

interface RejectIncidentModalProps {
  open: boolean
  onClose: () => void
  incident: Incident | null
  onSuccess: () => void
}

export function RejectIncidentModal({ open, onClose, incident, onSuccess }: RejectIncidentModalProps) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [touched, setTouched] = useState(false)

  const isValid = reason.trim().length >= 10

  const handleConfirm = async () => {
    setTouched(true)
    if (!incident || !isValid) return

    setSubmitting(true)
    try {
      await incidentService.reject(incident.id, reason)
      toast.success(`${incident.reference_code} has been rejected.`)
      onSuccess()
      onClose()
      setReason('')
      setTouched(false)
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
      title="Reject Incident"
      description={incident ? `${incident.reference_code} — ${incident.title}` : undefined}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirm} loading={submitting}>Reject Report</Button>
        </>
      }
    >
      <p className="text-sm text-ink/80">
        The farmer will be notified with the reason below. This action cannot be undone.
      </p>
      <label className="mt-4 block text-sm font-medium text-ink">Reason for rejection *</label>
      <textarea
        className="mt-1.5 w-full rounded-xl border-2 border-input bg-white px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:border-forest-light"
        rows={3}
        placeholder="e.g. Duplicate report, insufficient evidence, outside jurisdiction…"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      {touched && !isValid && (
        <p className="mt-1.5 text-xs text-danger">Please provide at least 10 characters explaining the rejection.</p>
      )}
    </Modal>
  )
}
