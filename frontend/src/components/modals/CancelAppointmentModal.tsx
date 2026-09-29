import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { XCircle } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { appointmentService } from '@/services/appointmentService'
import { getApiErrorMessage } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import type { Appointment } from '@/types'

const schema = z.object({
  cancellation_reason: z.string().min(10, 'Please explain why this visit is being cancelled (min. 10 characters)'),
})

type FormValues = z.infer<typeof schema>

interface CancelAppointmentModalProps {
  open: boolean
  onClose: () => void
  appointment: Appointment | null
  onSuccess: () => void
}

export function CancelAppointmentModal({ open, onClose, appointment, onSuccess }: CancelAppointmentModalProps) {
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
      await appointmentService.updateStatus(appointment.id, 'cancelled', {
        cancellation_reason: values.cancellation_reason,
      })
      toast.success('Appointment cancelled.')
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
      title="Cancel this visit?"
      description={
        appointment
          ? `Tell the farmer why this appointment with ${farmerName || 'them'} is being cancelled${appointment.scheduled_at ? ` · ${formatDateTime(appointment.scheduled_at)}` : ''}.`
          : undefined
      }
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={close}>Keep appointment</Button>
          <Button variant="danger" onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
            <XCircle className="h-4 w-4" /> Cancel visit
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {appointment?.purpose && (
          <p className="text-sm text-muted-foreground">Purpose: {appointment.purpose}</p>
        )}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Reason for cancelling *</label>
          <textarea
            className="w-full rounded-xl border-2 border-input bg-white px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:border-forest-light"
            rows={4}
            placeholder="Weather, overlapping field visit, farmer request, illness…"
            {...register('cancellation_reason')}
          />
          {errors.cancellation_reason && (
            <p className="mt-1.5 text-xs text-danger">{errors.cancellation_reason.message}</p>
          )}
        </div>
      </form>
    </Modal>
  )
}
