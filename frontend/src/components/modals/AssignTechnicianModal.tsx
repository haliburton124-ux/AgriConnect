import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { UserCheck } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { incidentService } from '@/services/incidentService'
import { getApiErrorMessage } from '@/lib/api'
import type { Incident } from '@/types'

interface Technician {
  id: number
  full_name: string
  phone: string
}

interface AssignTechnicianModalProps {
  open: boolean
  onClose: () => void
  incident: Incident | null
  onSuccess: () => void
}

export function AssignTechnicianModal({ open, onClose, incident, onSuccess }: AssignTechnicianModalProps) {
  const [technicians, setTechnicians] = useState<Technician[] | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      incidentService.listTechnicians().then((res) => setTechnicians(res.data.data))
    } else {
      setSelectedId(null)
      setNotes('')
      setTechnicians(null)
    }
  }, [open])

  const handleConfirm = async () => {
    if (!incident || !selectedId) return
    setSubmitting(true)
    try {
      await incidentService.assign(incident.id, selectedId, notes || undefined)
      toast.success('Technician assigned successfully.')
      onSuccess()
      onClose()
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
      title="Assign Technician"
      description={incident ? `${incident.reference_code} — ${incident.title}` : undefined}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} loading={submitting} disabled={!selectedId}>Assign Technician</Button>
        </>
      }
    >
      {technicians === null ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 w-full" />)}
        </div>
      ) : technicians.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No active technicians are available in your municipality right now.
        </p>
      ) : (
        <div className="space-y-2">
          {technicians.map((tech) => (
            <button
              key={tech.id}
              onClick={() => setSelectedId(tech.id)}
              className={cn(
                'flex w-full items-center justify-between rounded-xl border-2 p-3.5 text-left transition-colors',
                selectedId === tech.id ? 'border-forest bg-forest/5' : 'border-black/5 hover:border-forest-light/40',
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-white">
                  {tech.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{tech.full_name}</p>
                  <p className="text-xs text-muted-foreground">{tech.phone}</p>
                </div>
              </div>
              {selectedId === tech.id && <UserCheck className="h-5 w-5 text-forest" />}
            </button>
          ))}
        </div>
      )}

      <label className="mt-4 block text-sm font-medium text-ink">Notes for the technician (optional)</label>
      <textarea
        className="mt-1.5 w-full rounded-xl border-2 border-input bg-white px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:border-forest-light"
        rows={2}
        placeholder="e.g. Please prioritize — farmer reports rapid spread."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
    </Modal>
  )
}
