import { useState } from 'react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { incidentService } from '@/services/incidentService'
import { getApiErrorMessage } from '@/lib/api'
import type { Incident } from '@/types'

interface ValidateIncidentModalProps {
  open: boolean
  onClose: () => void
  incident: Incident | null
  onSuccess: () => void
}

export function ValidateIncidentModal({ open, onClose, incident, onSuccess }: ValidateIncidentModalProps) {
  const [remarks, setRemarks] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleConfirm = async () => {
    if (!incident) return
    setSubmitting(true)
    try {
      await incidentService.validate(incident.id, remarks || undefined)
      toast.success(`${incident.reference_code} validated and ready for technician assignment.`)
      onSuccess()
      onClose()
      setRemarks('')
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
      title="Validate Incident"
      description={incident ? `${incident.reference_code} — ${incident.title}` : undefined}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} loading={submitting}>Confirm Validation</Button>
        </>
      }
    >
      <p className="text-sm text-ink/80">
        Validating confirms this report is legitimate and ready for a technician to be assigned.
        You'll still be able to assign a technician afterward.
      </p>
      <label className="mt-4 block text-sm font-medium text-ink">Remarks (optional)</label>
      <textarea
        className="mt-1.5 w-full rounded-xl border-2 border-input bg-white px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:border-forest-light"
        rows={3}
        placeholder="Any notes for the record…"
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
      />
    </Modal>
  )
}
