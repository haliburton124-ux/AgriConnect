import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { TerraceDivider } from './TerraceDivider'

interface HeroSectionProps {
  onReportIncident: () => void
}

export function HeroSection({ onReportIncident }: HeroSectionProps) {
  return (
    <section id="home" className="relative flex h-[100vh] min-h-[640px] w-full items-center overflow-hidden bg-forest-dark">
      {/* Background image with Ken Burns zoom */}
      <div className="absolute inset-0">
        <picture>
          <source media="(max-width: 768px)" srcSet="/hero-farmers-mobile.jpg" />
          <img
            src="/hero-farmers.jpg"
            alt="Sunrise over strawberry terraces in the highlands — the fields AgriConnect was built to serve"
            className="h-full w-full animate-kenburns object-cover"
            fetchPriority="high"
          />
        </picture>
        {/* Dark gradient overlay for text legibility, tinted toward the brand hero gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-dark via-forest-dark/70 to-forest-dark/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-dark/80 via-forest-dark/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="max-w-2xl"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-sm ring-1 ring-white/20"
          >
            Province of Ilocos Norte
          </motion.span>

          <h1 className="font-sans text-3xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
            Empowering Farmers Through Modern{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #A5D6A7, #4FC3F7)' }}
            >
              Agricultural Extension
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg"
          >
            Report farm incidents, receive expert recommendations, monitor your farms, and
            connect directly with agricultural technicians across Ilocos Norte.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-10 flex flex-col gap-3.5 sm:flex-row"
          >
            <button
              onClick={onReportIncident}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-primary px-7 py-3.5 text-sm font-semibold text-white shadow-glass transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              Report Incident
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <Link
              to="/services"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-7 py-3.5 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <PlayCircle className="h-4 w-4" />
              Explore Services
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Signature terrace-line divider into the next section */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <TerraceDivider className="h-16 w-full sm:h-24" fill="canvas" />
      </div>

      {/* Scroll cue */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/70"
      >
        <div className="h-9 w-5 rounded-full border-2 border-white/50 p-1">
          <div className="h-1.5 w-1.5 rounded-full bg-white/80" />
        </div>
      </motion.div>
    </section>
  )
}
