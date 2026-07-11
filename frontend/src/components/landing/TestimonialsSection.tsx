import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { SectionHeading } from './SectionHeading'

// Illustrative farmer stories representative of Ilocos Norte's agricultural
// communities. Names and details are composites, not real individuals.
const TESTIMONIALS = [
  {
    quote: 'My rice paddies had brown planthoppers spreading fast. I reported it on AgriConnect in the morning and a technician was inspecting my field by the next afternoon. We caught it before it reached the neighboring farms.',
    name: 'Rosario Domingo',
    role: 'Rice Farmer',
    location: 'Dingras, Ilocos Norte',
  },
  {
    quote: 'Before this, I had to travel to the municipal office just to ask a simple question about fertilizer subsidies. Now I message the technician directly and get an answer the same day.',
    name: 'Marcelino Agustin',
    role: 'Corn Farmer',
    location: 'Batac City, Ilocos Norte',
  },
  {
    quote: 'The typhoon damaged part of my garlic crop. I logged the incident with photos right away, and the recommendation I received helped me save most of what was left.',
    name: 'Consolacion Rivera',
    role: 'Garlic Farmer',
    location: 'Pasuquin, Ilocos Norte',
  },
  {
    quote: "I registered all three of my farms with their GPS locations. When I report something now, the technician already knows exactly where to go.",
    name: 'Eduardo Bautista',
    role: 'Vegetable Farmer',
    location: 'Vintar, Ilocos Norte',
  },
]

export function TestimonialsSection() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % TESTIMONIALS.length), 6000)
    return () => clearInterval(timer)
  }, [])

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + TESTIMONIALS.length) % TESTIMONIALS.length)
  const current = TESTIMONIALS[index]

  return (
    <section className="bg-white px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <SectionHeading eyebrow="Farmer Stories" title="Trusted across Ilocos Norte" />

        <div className="relative mt-14">
          <Quote className="mx-auto h-10 w-10 text-forest/15" />

          <div className="relative mt-4 min-h-[220px] sm:min-h-[180px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 text-center"
              >
                <p className="text-lg font-medium leading-relaxed text-ink sm:text-xl">"{current.quote}"</p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-white">
                    {current.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-ink">{current.name}</p>
                    <p className="text-xs text-muted-foreground">{current.role} · {current.location}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-10 flex items-center justify-center gap-4">
            <button onClick={() => go(-1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-ink/60 transition-colors hover:bg-forest/5" aria-label="Previous story">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to story ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-forest' : 'w-2 bg-forest/20'}`}
                />
              ))}
            </div>
            <button onClick={() => go(1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-ink/60 transition-colors hover:bg-forest/5" aria-label="Next story">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
