import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Leaf, Sprout, CloudRain } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
}

/**
 * Split-screen auth shell: left panel is a full-bleed agriculture photo
 * with a gradient scrim for legibility (the platform's "signature" moment),
 * right panel holds the form inside a floating glass card over a soft canvas.
 */
export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Left: brand / hero panel */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Agriculture photo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        {/* Scrim for text legibility, tinted toward the brand green */}
        <div className="absolute inset-0 bg-gradient-to-b from-forest/80 via-forest/55 to-[#0c3623]/90" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-transparent" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3 text-white drop-shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 shadow-inner ring-1 ring-white/20 backdrop-blur-md">
            <Sprout className="h-6 w-6" />
          </div>
          <span className="text-xl font-semibold tracking-tight">AgriConnect</span>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 ring-1 ring-white/20 backdrop-blur-md">
              Provincial Agriculture Office · Ilocos Norte
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.15] tracking-tight">
              Connecting Ilocos Norte's
              <br />
              farmers to the help they need.
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/70">
              Report farm incidents, get expert guidance, and track every
              response in real time — from your barangay to the Provincial
              Agriculture Office.
            </p>
          </motion.div>

          <div className="mt-10 flex gap-3">
            {[Leaf, CloudRain, Sprout].map((Icon, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
                className="rounded-2xl border border-white/10 bg-white/10 p-3 shadow-lg backdrop-blur-md"
              >
                <Icon className="h-5 w-5" />
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/50">
          © {new Date().getFullYear()} Provincial Agriculture Office of Ilocos Norte
        </p>
      </div>

      {/* Right: form panel */}
      <div className="relative flex w-full items-center justify-center overflow-hidden bg-canvas px-6 py-8 lg:w-1/2">
        <div className="pointer-events-none absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-forest/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-1/4 h-72 w-72 rounded-full bg-teal-500/5 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="mb-6 flex items-center gap-2 text-forest lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest/10">
              <Sprout className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">AgriConnect</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-ink">{title}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </motion.div>
      </div>
    </div>
  )
}
