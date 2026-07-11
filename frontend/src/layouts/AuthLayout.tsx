import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Leaf, Sprout, CloudRain } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
}

/**
 * Split-screen auth shell: left panel carries the hero gradient + floating
 * icon motif (the platform's "signature" moment), right panel holds the
 * actual form in a clean white card.
 */
export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-hero lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        <div className="relative z-10 flex items-center gap-3 text-white">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Sprout className="h-6 w-6" />
          </div>
          <span className="text-xl font-semibold">AgriConnect</span>
        </div>

        <div className="relative z-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold leading-tight">
              Connecting Ilocos Norte's<br />farmers to the help they need.
            </h1>
            <p className="mt-4 max-w-md text-white/80">
              Report farm incidents, get expert guidance, and track every
              response in real time — from your barangay to the Provincial
              Agriculture Office.
            </p>
          </motion.div>

          <div className="mt-10 flex gap-6">
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }} className="rounded-xl bg-white/10 p-3 backdrop-blur">
              <Leaf className="h-6 w-6" />
            </motion.div>
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }} className="rounded-xl bg-white/10 p-3 backdrop-blur">
              <CloudRain className="h-6 w-6" />
            </motion.div>
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} className="rounded-xl bg-white/10 p-3 backdrop-blur">
              <Sprout className="h-6 w-6" />
            </motion.div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/60">
          © {new Date().getFullYear()} Provincial Agriculture Office of Ilocos Norte
        </p>
      </div>

      <div className="flex w-full items-center justify-center bg-canvas px-6 py-12 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 lg:hidden flex items-center gap-2 text-forest">
            <Sprout className="h-7 w-7" />
            <span className="text-lg font-semibold">AgriConnect</span>
          </div>
          <h2 className="text-2xl font-bold text-ink">{title}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </div>
  )
}
