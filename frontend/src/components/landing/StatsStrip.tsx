import { motion } from 'framer-motion'
import { CountUp } from './CountUp'

const STATS = [
  { value: 23, suffix: '', label: 'Municipalities Covered' },
  { value: 12400, suffix: '+', label: 'Farmers Served' },
  { value: 8900, suffix: '+', label: 'Incidents Resolved' },
  { value: 24, suffix: 'h', label: 'Avg. Response Time' },
]

export function StatsStrip() {
  return (
    <div className="relative z-20 mx-auto -mt-12 max-w-6xl px-4 sm:-mt-16 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-2 gap-6 rounded-[24px] bg-white p-8 shadow-glass ring-1 ring-black/5 sm:grid-cols-4 sm:p-10"
      >
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="bg-gradient-primary bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              <CountUp value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="mt-1.5 text-xs font-medium text-ink/55 sm:text-sm">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
