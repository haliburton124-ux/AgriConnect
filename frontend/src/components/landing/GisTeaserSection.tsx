import { motion } from 'framer-motion'
import { Map, Flame, Filter, Search as SearchIcon } from 'lucide-react'
import { SectionHeading } from './SectionHeading'

/**
 * The backend's GIS endpoints (cluster markers + heatmap) are currently
 * scoped to Municipal/Provincial Office and Admin — a farmer-facing,
 * privacy-safe view (e.g. anonymized incident density without exposing
 * individual farmer/farm details) isn't built yet. Rather than fake live
 * data, this is an honest preview of what's coming, styled to match the
 * rest of the premium experience.
 */
export function GisTeaserSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Coming Soon"
          title="See incidents across the province"
          description="An interactive map of incident activity across Ilocos Norte — with search, filters, and a live heatmap — is on its way to your account."
          light
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto mt-14 max-w-4xl overflow-hidden rounded-[24px] bg-white/10 p-2 ring-1 ring-white/20 backdrop-blur-sm"
        >
          <div className="relative flex aspect-[16/8] items-center justify-center overflow-hidden rounded-2xl bg-forest-dark/40">
            {/* Decorative "map" grid */}
            <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.4 }}
                className="absolute h-3 w-3 rounded-full bg-gold shadow-[0_0_16px_4px_rgba(249,168,37,0.5)]"
                style={{ top: `${20 + (i * 11) % 60}%`, left: `${15 + (i * 17) % 70}%` }}
              />
            ))}

            <div className="relative z-10 flex flex-col items-center gap-3 text-center text-white/90">
              <Map className="h-10 w-10" />
              <p className="text-sm font-medium">Interactive province-wide map — launching soon</p>
            </div>

            {/* Floating control chips, purely illustrative */}
            <div className="absolute left-4 top-4 flex gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs text-white backdrop-blur-sm"><SearchIcon className="h-3 w-3" /> Search</span>
              <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs text-white backdrop-blur-sm"><Filter className="h-3 w-3" /> Filters</span>
            </div>
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
              <Flame className="h-3 w-3" /> Heatmap
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
