import { motion } from 'framer-motion'
import { FileEdit, UserCheck, Search, ClipboardCheck, CheckCircle2 } from 'lucide-react'
import { SectionHeading } from './SectionHeading'

const STEPS = [
  { title: 'Submit Request', description: 'Report an incident or request assistance in under a minute, with photos and GPS.', icon: FileEdit },
  { title: 'Technician Assigned', description: 'Your Municipal Agriculture Office validates the report and assigns a technician.', icon: UserCheck },
  { title: 'Farm Inspection', description: 'The technician visits your farm or schedules a consultation to assess the issue.', icon: Search },
  { title: 'Recommendations', description: 'You receive a clear treatment plan and next steps, straight to your account.', icon: ClipboardCheck },
  { title: 'Issue Resolved', description: 'The case is closed and logged, so you always have a record of what happened.', icon: CheckCircle2 },
]

export function ExtensionProcessSection() {
  return (
    <section id="extension" className="scroll-mt-24 bg-white px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Agricultural Extension"
          title="From report to resolution, fully tracked"
          description="Every request follows the same transparent path — you'll always know exactly where things stand."
        />

        <div className="relative mt-16">
          {/* Connecting line */}
          <div className="absolute left-[27px] top-0 h-full w-px bg-gradient-to-b from-forest via-forest-light to-sky sm:left-1/2 sm:-translate-x-1/2" />

          <div className="space-y-10 sm:space-y-0">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`relative flex items-start gap-6 sm:mb-10 sm:items-center ${
                  i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
                }`}
              >
                <div className={`hidden flex-1 sm:block ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                  <span className="text-xs font-bold uppercase tracking-wide text-forest">Step {i + 1}</span>
                  <h3 className="mt-1 text-xl font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{step.description}</p>
                </div>

                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-white shadow-glass ring-4 ring-canvas">
                  <step.icon className="h-6 w-6" />
                </div>

                <div className="flex-1 sm:hidden">
                  <span className="text-xs font-bold uppercase tracking-wide text-forest">Step {i + 1}</span>
                  <h3 className="mt-1 text-lg font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{step.description}</p>
                </div>

                <div className="hidden flex-1 sm:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
