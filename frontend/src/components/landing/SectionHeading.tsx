import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
  light?: boolean
  className?: string
}

export function SectionHeading({ eyebrow, title, description, align = 'center', light = false, className }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className={cn('mx-auto max-w-2xl', align === 'center' ? 'text-center' : 'text-left', className)}
    >
      <span className={cn(
        'inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wide',
        light ? 'bg-white/10 text-white ring-1 ring-white/20' : 'bg-forest/10 text-forest',
      )}>
        {eyebrow}
      </span>
      <h2 className={cn('mt-4 text-3xl font-bold leading-tight sm:text-4xl', light ? 'text-white' : 'text-ink')}>
        {title}
      </h2>
      {description && (
        <p className={cn('mt-4 text-base leading-relaxed', light ? 'text-white/75' : 'text-ink/65')}>
          {description}
        </p>
      )}
    </motion.div>
  )
}
