import { HeroSection } from '@/components/landing/HeroSection'
import { StatsStrip } from '@/components/landing/StatsStrip'
import { KnowledgeHubSection } from '@/components/landing/KnowledgeHubSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { useFarmerActions } from '@/contexts/FarmerActionsContext'

export function HomePage() {
  const { openReportIncident } = useFarmerActions()

  return (
    <>
      <HeroSection onReportIncident={openReportIncident} />
      <StatsStrip />
      <KnowledgeHubSection />
      <TestimonialsSection />
    </>
  )
}
