import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { appointmentService } from '@/services/appointmentService'
import { getApiErrorMessage } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import type { Appointment } from '@/types'

const schema = z.object({
  completion_findings: z.string().min(10, 'Describe what you observed on-site (min. 10 characters)'),
  completion_outcome: z.string().min(10, 'Describe the actions taken or outcome of the visit'),
  completion_follow_up: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface CompleteAppointmentModalProps {
  open: boolean
  onClose: () => void
  appointment: Appointment | null
  onSuccess: () => void
}

export function CompleteAppointmentModal({ open, onClose, appointment, onSuccess }: CompleteAppointmentModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const close = () => {
    reset()
    onClose()
  }

  const onSubmit = async (values: FormValues) => {
    if (!appointment) return
    try {
      await appointmentService.updateStatus(appointment.id, 'completed', {
        completion_findings: values.completion_findings,
        completion_outcome: values.completion_outcome,
        completion_follow_up: values.completion_follow_up || undefined,
      })
      toast.success('Visit marked as completed.')
      onSuccess()
      close()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const farmerName = appointment
    ? `${appointment.farmer?.first_name ?? ''} ${appointment.farmer?.last_name ?? ''}`.trim()
    : ''

  return (
    <Modal
      open={open}
      onClose={close}
      title="Complete Visit"
      description={appointment ? `Submit your visit report for ${farmerName || 'this farmer'}${appointment.scheduled_at ? ` · ${formatDateTime(appointment.scheduled_at)}` : ''}` : undefined}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={close}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
            <CheckCircle2 className="h-4 w-4" /> Submit and Complete
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {appointment?.purpose && (
          <p className="text-sm text-muted-foreground">Purpose: {appointment.purpose}</p>
        )}
        {appointment?.notes && (
          <p className="text-sm text-ink/70">
            <span className="font-medium text-ink/80">Farmer notes: </span>
            {appointment.notes}
          </p>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Inspection notes *</label>
          <textarea
            className="w-full rounded-xl border-2 border-input bg-white px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:border-forest-light"
            rows={3}
            placeholder="What did you observe on-site?"
            {...register('completion_findings')}
          />
          {errors.completion_findings && <p className="mt-1.5 text-xs text-danger">{errors.completion_findings.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Actions taken / outcome *</label>
          <textarea
            className="w-full rounded-xl border-2 border-input bg-white px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:border-forest-light"
            rows={3}
            placeholder="Treatment given, advice provided, or result of the visit…"
            {...register('completion_outcome')}
          />
          {errors.completion_outcome && <p className="mt-1.5 text-xs text-danger">{errors.completion_outcome.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Follow-up (optional)</label>
          <textarea
            className="w-full rounded-xl border-2 border-input bg-white px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:border-forest-light"
            rows={2}
            placeholder="Any next steps for the farmer…"
            {...register('completion_follow_up')}
          />
        </div>
      </form>
    </Modal>
  )
}
