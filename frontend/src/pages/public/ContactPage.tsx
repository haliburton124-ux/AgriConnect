import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock, Facebook, Instagram } from 'lucide-react'
import { SectionHeading } from '@/components/landing/SectionHeading'

export function ContactPage() {
  return (
    <div className="bg-canvas px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Get in Touch"
          title="Contact the Provincial Agriculture Office"
          description="Reach the Provincial and Municipal Agriculture Offices of Ilocos Norte for support, inquiries, and agricultural extension services."
        />

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[22px] bg-white p-8 shadow-soft ring-1 ring-black/5"
          >
            <h2 className="text-lg font-semibold text-ink">Office Location</h2>
            <ul className="mt-6 space-y-5 text-sm text-ink/80">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
                Provincial Capitol Complex, Laoag City, Ilocos Norte 2900
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-forest" />
                (077) 000-0000
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-forest" />
                agriculture@ilocosnorte.gov.ph
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 shrink-0 text-forest" />
                Monday – Friday, 8:00 AM – 5:00 PM
              </li>
            </ul>

            <div className="mt-8 flex gap-3">
              <a href="#" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/10 text-forest transition-colors hover:bg-forest hover:text-white">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/10 text-forest transition-colors hover:bg-forest hover:text-white">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="overflow-hidden rounded-[22px] bg-forest-dark shadow-soft ring-1 ring-black/5"
          >
            <div className="flex aspect-[4/3] items-center justify-center bg-gradient-hero p-8 text-center text-white">
              <div>
                <MapPin className="mx-auto h-12 w-12 text-white/80" />
                <p className="mt-4 text-sm leading-relaxed text-white/85">
                  Visit the Provincial Agriculture Office at the Capitol Complex in Laoag City for in-person assistance with farm incidents, programs, and extension services.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
