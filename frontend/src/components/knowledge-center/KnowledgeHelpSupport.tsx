import { ClipboardList, Headphones } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface KnowledgeHelpSupportProps {
  onContactTechnician: () => void
  onReportProblem: () => void
}

export function KnowledgeHelpSupport({ onContactTechnician, onReportProblem }: KnowledgeHelpSupportProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-soft">
        <div className="grid lg:grid-cols-2">
          <div className="flex flex-col justify-center gap-4 border-b border-black/5 p-8 lg:border-b-0 lg:border-r">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest/10 text-forest">
              <Headphones className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-ink">Still need help?</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Our agricultural technicians are here to help you.
              </p>
            </div>
            <Button onClick={onContactTechnician} className="w-fit">
              Contact Technician
            </Button>
          </div>

          <div className="flex flex-col justify-center gap-4 bg-forest/[0.03] p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-ink">Report a Crop Problem</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Experiencing pests, diseases, crop damage, or other farm problems? Report it to
                your agricultural technician.
              </p>
            </div>
            <Button variant="outline" onClick={onReportProblem} className="w-fit border-forest/30">
              Report Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
