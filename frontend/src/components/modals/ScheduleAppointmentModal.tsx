import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getApiErrorMessage } from '@/lib/api'
import { appointmentService, type AppointmentTechnician } from '@/services/appointmentService'
import { incidentService } from '@/services/incidentService'
import { useAuthStore } from '@/store/authStore'
import type { Incident } from '@/types'

function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === 'object') {
    const inner = (payload as { data?: unknown }).data
    if (Array.isArray(inner)) return inner
    if (inner && typeof inner === 'object') {
      const nested = (inner as { data?: unknown }).data
      if (Array.isArray(nested)) return nested
    }
  }
  return []
}

function techniciansFromIncidents(payload: unknown): AppointmentTechnician[] {
  const incidents = unwrapList<Incident>(payload)
  const byId = new Map<number, AppointmentTechnician>()
  for (const incident of incidents) {
    const tech = incident.assigned_technician
    if (tech?.id) {
      byId.set(tech.id, {
        id: tech.id,
        full_name: tech.full_name,
        phone: tech.phone,
        assigned: true,
      })
    }
  }
  return [...byId.values()]
}

function mergeTechnicians(...groups: AppointmentTechnician[][]): AppointmentTechnician[] {
  const byId = new Map<number, AppointmentTechnician>()
  for (const group of groups) {
    for (const tech of group) {
      const existing = byId.get(tech.id)
      byId.set(tech.id, {
        ...existing,
        ...tech,
        assigned: Boolean(existing?.assigned || tech.assigned),
      })
    }
  }
  return [...byId.values()].sort((a, b) => Number(Boolean(b.assigned)) - Number(Boolean(a.assigned)))
}

const schema = z.object({
  counterpart_id: z.coerce.number().min(1, 'Select who you want to meet'),
  scheduled_at: z.string().min(1, 'Pick a date and time'),
  purpose: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface ScheduleAppointmentModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

/**
 * Farmer books a visit with the technician assigned to their incidents
 * (and other active technicians in the same municipality).
 */
export function ScheduleAppointmentModal({ open, onClose, onSuccess }: ScheduleAppointmentModalProps) {
  const { user } = useAuthStore()
  const isFarmer = user?.role === 'farmer'
  const [counterparts, setCounterparts] = useState<AppointmentTechnician[]>([])
  const [loadingTechnicians, setLoadingTechnicians] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!open || !isFarmer) return

    let cancelled = false
    setLoadingTechnicians(true)

    Promise.allSettled([
      appointmentService.listTechnicians(),
      incidentService.listMine({ per_page: 100 }),
    ]).then(([techResult, incidentResult]) => {
      if (cancelled) return

      const fromDirectory = techResult.status === 'fulfilled'
        ? unwrapList<AppointmentTechnician>(techResult.value.data)
        : []
      const fromIncidents = incidentResult.status === 'fulfilled'
        ? techniciansFromIncidents(incidentResult.value.data)
        : []
      const list = mergeTechnicians(fromDirectory, fromIncidents)

      setCounterparts(list)
      const preferred = list.find((tech) => tech.assigned) ?? (list.length === 1 ? list[0] : undefined)
      if (preferred) {
        setValue('counterpart_id', preferred.id)
      }
    }).finally(() => {
      if (!cancelled) setLoadingTechnicians(false)
    })

    return () => {
      cancelled = true
    }
  }, [open, isFarmer, setValue])

  const close = () => {
    reset()
    setCounterparts([])
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
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting} disabled={isFarmer && counterparts.length === 0}>
            Schedule Appointment
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        {isFarmer ? (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Technician</label>
            <select
              className="h-11 w-full rounded-xl border-2 border-input bg-white px-4 text-sm focus-visible:outline-none focus-visible:border-forest-light disabled:opacity-60"
              disabled={loadingTechnicians || counterparts.length === 0}
              {...register('counterpart_id')}
            >
              <option value="">{loadingTechnicians ? 'Loading technicians…' : 'Select a technician…'}</option>
              {counterparts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}{c.assigned ? ' (Assigned)' : ''}
                </option>
              ))}
            </select>
            {errors.counterpart_id && <p className="mt-1.5 text-xs text-danger">{errors.counterpart_id.message}</p>}
            {!loadingTechnicians && counterparts.length === 0 && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                No technician is available yet. Once MAO assigns a technician to your incident, they will appear here.
              </p>
            )}
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
