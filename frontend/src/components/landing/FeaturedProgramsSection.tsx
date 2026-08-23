import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Calendar, ArrowRight, Gift } from 'lucide-react'
import { SectionHeading } from './SectionHeading'
import { programService } from '@/services/programService'
import { useAuthStore } from '@/store/authStore'
import { formatDate } from '@/lib/utils'
import type { Program } from '@/types'

const CATEGORY_COLORS: Record<Program['category'], string> = {
  subsidy: '#2E7D32',
  training: '#0288D1',
  loan: '#F9A825',
  seedling: '#66BB6A',
  equipment: '#6D4C41',
  insurance: '#8E24AA',
  other: '#616161',
}

export function FeaturedProgramsSection() {
  const [programs, setPrograms] = useState<Program[] | null>(null)
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    programService.list().then((res) => setPrograms(res.data.data.slice(0, 3)))
  }, [])

  const handleApply = () => {
    navigate(isAuthenticated ? '/farmer/programs' : '/government-programs')
  }

  return (
    <section id="programs" className="scroll-mt-24 bg-canvas px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Government Programs"
            title="Support built for your farm"
            align="left"
            className="mx-0 max-w-xl text-left"
          />
          <button
            onClick={handleApply}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-forest px-5 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-white"
          >
            View all programs <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {programs === null ? (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-72 w-full rounded-[22px]" />)}
          </div>
        ) : programs.length === 0 ? (
          <div className="mt-12 flex flex-col items-center rounded-[22px] bg-white p-12 text-center shadow-soft">
            <Gift className="h-10 w-10 text-forest-light" />
            <p className="mt-3 text-sm text-ink/60">No programs are open right now — check back soon.</p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {programs.map((program, i) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="group flex flex-col overflow-hidden rounded-[22px] bg-white shadow-soft ring-1 ring-black/5 transition-shadow hover:shadow-glass"
              >
                <div
                  className="flex h-32 items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${CATEGORY_COLORS[program.category]}, ${CATEGORY_COLORS[program.category]}CC)` }}
                >
                  <Gift className="h-10 w-10 text-white/90 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span
                    className="w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize"
                    style={{ backgroundColor: `${CATEGORY_COLORS[program.category]}15`, color: CATEGORY_COLORS[program.category] }}
                  >
                    {program.category}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-ink">{program.title}</h3>
                  <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-ink/60">{program.description}</p>
                  {program.application_end && (
                    <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" /> Apply by {formatDate(program.application_end)}
                    </p>
                  )}
                  <button
                    onClick={handleApply}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-forest transition-transform group-hover:translate-x-1"
                  >
                    Apply Now <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
