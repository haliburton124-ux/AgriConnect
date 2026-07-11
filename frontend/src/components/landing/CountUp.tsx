import { useEffect, useRef, useState } from 'react'
import { useInView, animate } from 'framer-motion'

interface CountUpProps {
  value: number
  suffix?: string
  duration?: number
  className?: string
}

/** Animates from 0 to `value` once it scrolls into view. Runs only once. */
export function CountUp({ value, suffix = '', duration = 1.6, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, value, duration])

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString()}{suffix}
    </span>
  )
}
