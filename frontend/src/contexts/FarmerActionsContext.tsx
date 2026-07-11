import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ReportIncidentModal } from '@/components/modals/ReportIncidentModal'
import { ScheduleAppointmentModal } from '@/components/modals/ScheduleAppointmentModal'

interface FarmerActionsContextValue {
  requireAuth: (openModal: () => void) => void
  openReportIncident: () => void
  openRequestVisit: () => void
}

const FarmerActionsContext = createContext<FarmerActionsContextValue | null>(null)

export function FarmerActionsProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [reportOpen, setReportOpen] = useState(false)
  const [visitOpen, setVisitOpen] = useState(false)

  const requireAuth = useCallback((openModal: () => void) => {
    if (isAuthenticated) openModal()
    else navigate('/login')
  }, [isAuthenticated, navigate])

  const openReportIncident = useCallback(() => {
    requireAuth(() => setReportOpen(true))
  }, [requireAuth])

  const openRequestVisit = useCallback(() => {
    requireAuth(() => setVisitOpen(true))
  }, [requireAuth])

  return (
    <FarmerActionsContext.Provider value={{ requireAuth, openReportIncident, openRequestVisit }}>
      {children}
      <ReportIncidentModal open={reportOpen} onClose={() => setReportOpen(false)} onSuccess={() => setReportOpen(false)} />
      <ScheduleAppointmentModal open={visitOpen} onClose={() => setVisitOpen(false)} onSuccess={() => setVisitOpen(false)} />
    </FarmerActionsContext.Provider>
  )
}

export function useFarmerActions() {
  const ctx = useContext(FarmerActionsContext)
  if (!ctx) throw new Error('useFarmerActions must be used within FarmerActionsProvider')
  return ctx
}
