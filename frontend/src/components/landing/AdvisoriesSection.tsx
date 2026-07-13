import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CloudRain, Bug, Leaf, TrendingUp, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { SectionHeading } from './SectionHeading'
import { ExpandableText } from '@/components/ui/ExpandableText'
import { advisoryService, type Advisory } from '@/services/advisoryService'
import { formatDate } from '@/lib/utils'

const TYPE_META: Record<Advisory['type'], { icon: typeof CloudRain; label: string; color: string }> = {
  weather: { icon: CloudRain, label: 'Weather Alert', color: '#0288D1' },
  pest: { icon: Bug, label: 'Pest Alert', color: '#F9A825' },
  disease: { icon: Leaf, label: 'Disease Alert', color: '#D32F2F' },
  market: { icon: TrendingUp, label: 'Market Update', color: '#2E7D32' },
  general: { icon: Info, label: 'Advisory', color: '#607D8B' },
}

export function AdvisoriesSection() {
  const [advisories, setAdvisories] = useState<Advisory[] | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    advisoryService.list().then((res) => setAdvisories(res.data.data))
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' })
  }

  if (advisories !== null && advisories.length === 0) return null

  return (
    <section className="bg-white px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Stay Ahead"
            title="Agricultural Advisories"
            align="left"
            className="mx-0 max-w-xl text-left"
          />
          <div className="hidden gap-2 sm:flex">
            <button onClick={() => scroll('left')} className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-ink/60 transition-colors hover:bg-forest/5">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => scroll('right')} className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-ink/60 transition-colors hover:bg-forest/5">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {advisories === null ? (
          <div className="mt-10 flex gap-5 overflow-hidden">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-48 w-80 shrink-0 rounded-[22px]" />)}
          </div>
        ) : (
          <div ref={scrollRef} className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {advisories.map((advisory, i) => {
              const meta = TYPE_META[advisory.type]
              return (
                <motion.div
                  key={advisory.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="w-80 shrink-0 snap-start rounded-[22px] bg-canvas p-6 ring-1 ring-black/5"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ backgroundColor: meta.color }}>
                      <meta.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: meta.color }}>{meta.label}</span>
                  </div>
                  <h3 className="mt-4 font-semibold text-ink">{advisory.title}</h3>
                  <ExpandableText text={advisory.content} className="mt-2 text-ink/60" />
                  <p className="mt-4 text-xs text-muted-foreground">{formatDate(advisory.created_at)}</p>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
