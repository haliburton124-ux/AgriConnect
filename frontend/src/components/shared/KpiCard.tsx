import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  tone?: 'primary' | 'gold' | 'sky' | 'danger' | 'success'
  delay?: number
}

const toneStyles: Record<string, string> = {
  primary: 'bg-gradient-primary text-white',
  gold: 'bg-gradient-to-br from-gold to-[#F57F17] text-white',
  sky: 'bg-gradient-tech text-white',
  danger: 'bg-gradient-to-br from-danger to-[#B71C1C] text-white',
  success: 'bg-gradient-to-br from-success to-forest-dark text-white',
}

/** KPI card used across every role's dashboard — hover lift + icon glow. */
export function KpiCard({ label, value, icon: Icon, tone = 'primary', delay = 0 }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3 }}
      className="rounded-2xl bg-white p-5 shadow-card transition-shadow hover:shadow-glass"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-ink">{value}</p>
        </div>
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', toneStyles[tone])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  )
}
