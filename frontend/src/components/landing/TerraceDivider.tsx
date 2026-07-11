interface TerraceDividerProps {
  className?: string
  /** 'light' for use on dark/photo backgrounds, 'canvas' for the page background color. */
  fill?: 'light' | 'canvas'
}

/**
 * The recurring signature motif of the Farmer experience: a set of curved,
 * terraced contour lines lifted directly from the rhythm of the hero
 * photograph's strawberry terraces. Used at section boundaries instead of a
 * straight edge or a generic wave, so the page's structure itself echoes
 * the land it's describing.
 */
export function TerraceDivider({ className = '', fill = 'canvas' }: TerraceDividerProps) {
  const color = fill === 'canvas' ? '#F8FAF5' : '#FFFFFF'

  return (
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <path d="M0,80 C240,40 480,110 720,70 C960,30 1200,90 1440,50 L1440,120 L0,120 Z" fill={color} opacity="0.55" />
      <path d="M0,95 C240,60 480,120 720,90 C960,60 1200,110 1440,75 L1440,120 L0,120 Z" fill={color} opacity="0.75" />
      <path d="M0,110 C240,85 480,120 720,105 C960,90 1200,120 1440,100 L1440,120 L0,120 Z" fill={color} />
    </svg>
  )
}
