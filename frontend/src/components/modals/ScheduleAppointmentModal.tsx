import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { api, getApiErrorMessage } from '@/lib/api'
import { appointmentService } from '@/services/appointmentService'
import { useAuthStore } from '@/store/authStore'

const schema = z.object({
  counterpart_id: z.coerce.number().min(1, 'Select who you want to meet'),
  scheduled_at: z.string().min(1, 'Pick a date and time'),
  purpose: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Counterpart {
  id: number
  full_name: string
}

interface ScheduleAppointmentModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

/**
 * "Schedule Visit Modal" — a farmer books a visit with a technician (or
 * vice versa). Since a farmer only ever coordinates with the technician
 * assigned to their incidents, the counterpart list is pulled from the
 * MAO's technician directory for farmers, or would come from an incident
 * context for technicians (kept simple here: technicians type a farmer's
 * name is out of scope for MVP — this modal focuses on the farmer flow).
 */
export function ScheduleAppointmentModal({ open, onClose, onSuccess }: ScheduleAppointmentModalProps) {
  const { user } = useAuthStore()
  const isFarmer = user?.role === 'farmer'
  const [counterparts, setCounterparts] = useState<Counterpart[]>([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open && isFarmer) {
      api.get('/mao/technicians').then((res) => setCounterparts(res.data.data)).catch(() => setCounterparts([]))
    }
  }, [open, isFarmer])

  const close = () => {
    reset()
    onClose()
  }

  const onSubmit = async (values: FormValues) => {
    try {
      await appointmentService.create({
        technician_id: isFarmer ? values.counterpart_id : undefined,
        farmer_id: !isFarmer ? values.counterpart_id : undefined,
        scheduled_at: values.scheduled_at,
        purpose: values.purpose,
        notes: values.notes,
      })
      toast.success('Appointment scheduled successfully.')
      onSuccess()
      close()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Schedule Visit"
      description="Coordinate an on-site inspection or consultation."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={close}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>Schedule Appointment</Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        {isFarmer ? (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Technician</label>
            <select
              className="h-11 w-full rounded-xl border-2 border-input bg-white px-4 text-sm focus-visible:outline-none focus-visible:border-forest-light"
              {...register('counterpart_id')}
            >
              <option value="">Select a technician…</option>
              {counterparts.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
            {errors.counterpart_id && <p className="mt-1.5 text-xs text-danger">{errors.counterpart_id.message}</p>}
          </div>
        ) : (
          <Input label="Farmer ID" type="number" error={errors.counterpart_id?.message} {...register('counterpart_id')} />
        )}

        <Input type="datetime-local" label="Date & time" error={errors.scheduled_at?.message} {...register('scheduled_at')} />
        <Input label="Purpose (optional)" placeholder="e.g. Follow-up inspection" {...register('purpose')} />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Notes (optional)</label>
          <textarea
            className="w-full rounded-xl border-2 border-input bg-white px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:border-forest-light"
            rows={2}
            {...register('notes')}
          />
        </div>
      </form>
    </Modal>
  )
}
