import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { CalendarClock, Plus, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ScheduleAppointmentModal } from '@/components/modals/ScheduleAppointmentModal'
import { appointmentService } from '@/services/appointmentService'
import { useAuthStore } from '@/store/authStore'
import { getApiErrorMessage } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import type { Appointment } from '@/types'

const STATUS_BADGE: Record<Appointment['status'], 'resolved' | 'pending' | 'rejected' | 'neutral'> = {
  scheduled: 'pending',
  confirmed: 'neutral',
  completed: 'resolved',
  cancelled: 'rejected',
  no_show: 'rejected',
}

export function AppointmentsPage() {
  const { user } = useAuthStore()
  const isFarmer = user?.role === 'farmer'
  const [appointments, setAppointments] = useState<Appointment[] | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const load = () => {
    setAppointments(null)
    appointmentService.list().then((res) => setAppointments(res.data.data))
  }

  useEffect(load, [])

  const handleStatusChange = async (appt: Appointment, status: Appointment['status']) => {
    try {
      await appointmentService.updateStatus(appt.id, status)
      toast.success('Appointment updated.')
      load()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">Appointments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isFarmer ? 'Schedule and track visits with your assigned technician.' : 'Your scheduled farm visits.'}
          </p>
        </div>
        {isFarmer && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Schedule Visit
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {appointments === null ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 w-full" />)}
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={CalendarClock} title="No appointments yet" description="Scheduled visits will appear here." actionLabel={isFarmer ? 'Schedule Visit' : undefined} onAction={isFarmer ? () => setModalOpen(true) : undefined} />
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {appointments.map((appt) => (
                <div key={appt.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-forest/10 text-forest">
                      <CalendarClock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {isFarmer ? appt.technician?.first_name : appt.farmer?.first_name}{' '}
                        {isFarmer ? appt.technician?.last_name : appt.farmer?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(appt.scheduled_at)}{appt.purpose ? ` · ${appt.purpose}` : ''}
                      </p>
                      {appt.incident && <p className="text-xs text-forest">Re: {appt.incident.reference_code}</p>}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={STATUS_BADGE[appt.status]}>{appt.status.replace('_', ' ')}</Badge>
                    {(appt.status === 'scheduled' || appt.status === 'confirmed') && (
                      <>
                        <Button size="icon" variant="ghost" title="Mark completed" onClick={() => handleStatusChange(appt, 'completed')}>
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        </Button>
                        <Button size="icon" variant="ghost" title="Cancel" onClick={() => handleStatusChange(appt, 'cancelled')}>
                          <XCircle className="h-4 w-4 text-danger" />
                        </Button>
                        {appt.status === 'scheduled' && (
                          <Button size="icon" variant="ghost" title="Confirm" onClick={() => handleStatusChange(appt, 'confirmed')}>
                            <Clock className="h-4 w-4 text-sky" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ScheduleAppointmentModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={load} />
    </div>
  )
}
