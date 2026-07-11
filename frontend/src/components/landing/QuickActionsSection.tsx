import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CalendarClock, MessageCircleQuestion, MapPin, ClipboardList, Gift, ArrowUpRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { SectionHeading } from './SectionHeading'

interface QuickActionsSectionProps {
  onReportIncident: () => void
  onRequestVisit: () => void
}

export function QuickActionsSection({ onReportIncident, onRequestVisit }: QuickActionsSectionProps) {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const goOrLogin = (path: string) => {
    navigate(isAuthenticated ? path : '/login')
  }

  const actions = [
    {
      title: 'Report Incident',
      description: 'Flag crop disease, pests, flooding, or any farm emergency for rapid response.',
      icon: AlertTriangle,
      gradient: 'from-[#2E7D32] to-[#66BB6A]',
      onClick: onReportIncident,
    },
    {
      title: 'Request Farm Visit',
      description: 'Book an on-site inspection with an agricultural technician near you.',
      icon: CalendarClock,
      gradient: 'from-[#0288D1] to-[#2E7D32]',
      onClick: onRequestVisit,
    },
    {
      title: 'Agricultural Consultation',
      description: 'Message a technician directly for advice, treatment plans, or a second opinion.',
      icon: MessageCircleQuestion,
      gradient: 'from-[#F9A825] to-[#EF6C00]',
      onClick: () => goOrLogin('/farmer/messages'),
    },
    {
      title: 'My Farms',
      description: 'Register your farms with GPS coordinates so help finds you faster.',
      icon: MapPin,
      gradient: 'from-[#66BB6A] to-[#0288D1]',
      onClick: () => goOrLogin('/farmer/farms'),
    },
    {
      title: 'Track Reports',
      description: 'Follow every report from submission to resolution, in real time.',
      icon: ClipboardList,
      gradient: 'from-[#1B5E20] to-[#66BB6A]',
      onClick: () => goOrLogin('/farmer/incidents'),
    },
    {
      title: 'Government Programs',
      description: 'Browse subsidies, training, loans, and equipment support you can apply for.',
      icon: Gift,
      gradient: 'from-[#0288D1] to-[#F9A825]',
      onClick: () => goOrLogin('/government-programs'),
    },
  ]

  return (
    <section id="services" className="scroll-mt-24 bg-canvas px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="What you can do"
          title="Everything you need, one tap away"
          description="AgriConnect puts the Municipal and Provincial Agriculture Offices directly in your pocket."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action, i) => (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              whileHover={{ y: -6 }}
              onClick={action.onClick}
              className="group relative overflow-hidden rounded-[22px] bg-white p-7 text-left shadow-soft ring-1 ring-black/5 transition-shadow hover:shadow-glass"
            >
              <div className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${action.gradient} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30`} />

              <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${action.gradient} text-white shadow-card transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <action.icon className="h-7 w-7" />
              </div>

              <h3 className="relative mt-5 flex items-center gap-1.5 text-lg font-semibold text-ink">
                {action.title}
                <ArrowUpRight className="h-4 w-4 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-ink/60">{action.description}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
