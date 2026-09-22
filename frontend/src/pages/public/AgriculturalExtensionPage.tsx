import { ExtensionProcessSection } from '@/components/landing/ExtensionProcessSection'
import { GisTeaserSection } from '@/components/landing/GisTeaserSection'
import { AdvisoriesSection } from '@/components/landing/AdvisoriesSection'

export function AgriculturalExtensionPage() {
  return (
    <div className="pt-28">
      <ExtensionProcessSection />
      <AdvisoriesSection />
      <GisTeaserSection />
    </div>
  )
}
