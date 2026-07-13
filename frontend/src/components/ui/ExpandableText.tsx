import { useEffect, useId, useRef, useState, type MouseEvent } from 'react'
import { cn } from '@/lib/utils'

interface ExpandableTextProps {
  text: string
  maxLines?: number
  maxLength?: number
  className?: string
}

export function ExpandableText({
  text,
  maxLines = 3,
  maxLength = 150,
  className,
}: ExpandableTextProps) {
  const contentId = useId()
  const measureRef = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [canExpand, setCanExpand] = useState(false)

  useEffect(() => {
    setExpanded(false)
    setCanExpand(false)
  }, [text])

  useEffect(() => {
    const element = measureRef.current
    if (!element || expanded) return

    const update = () => {
      const exceedsLength = text.trim().length > maxLength
      const exceedsLines = element.scrollHeight > element.clientHeight + 1
      setCanExpand(exceedsLength || exceedsLines)
    }

    update()
    window.addEventListener('resize', update)

    return () => window.removeEventListener('resize', update)
  }, [text, maxLength, maxLines, expanded])

  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    event.preventDefault()
    setExpanded((current) => !current)
  }

  if (!text.trim()) return null

  return (
    <div className="space-y-1">
      <div
        className={cn(
          'overflow-hidden transition-[max-height] duration-300 ease-in-out',
          expanded ? 'max-h-[2000px]' : undefined,
        )}
        style={expanded ? undefined : { maxHeight: `${maxLines * 1.625}rem` }}
      >
        <p
          ref={measureRef}
          id={contentId}
          className={cn(
            'whitespace-pre-wrap text-sm leading-relaxed',
            !expanded && 'line-clamp-3',
            className,
          )}
        >
          {text}
        </p>
      </div>

      {canExpand && (
        <button
          type="button"
          onClick={toggle}
          className="text-sm font-semibold text-forest transition-colors hover:text-forest-light hover:underline"
          aria-expanded={expanded}
          aria-controls={contentId}
        >
          {expanded ? 'See less' : 'See more'}
        </button>
      )}
    </div>
  )
}
