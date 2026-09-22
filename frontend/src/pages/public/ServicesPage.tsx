import { QuickActionsSection } from '@/components/landing/QuickActionsSection'
import { useFarmerActions } from '@/contexts/FarmerActionsContext'

export function ServicesPage() {
  const { openReportIncident, openRequestVisit } = useFarmerActions()

  return (
    <div className="pt-28">
      <QuickActionsSection
        onReportIncident={openReportIncident}
        onRequestVisit={openRequestVisit}
      />
    </div>
  )
}
