import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EvidenceImage {
  id: number | string
  url: string
  alt?: string
}

interface EvidenceLightboxProps {
  open: boolean
  onClose: () => void
  images: EvidenceImage[]
  initialIndex?: number
}

const MIN_SCALE = 1
const MAX_SCALE = 4

export function EvidenceLightbox({ open, onClose, images, initialIndex = 0 }: EvidenceLightboxProps) {
  const [index, setIndex] = useState(initialIndex)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const touchStartX = useRef<number | null>(null)
  const pinchStartDistance = useRef<number | null>(null)
  const pinchStartScale = useRef(1)
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)

  const hasMultiple = images.length > 1
  const current = images[index]

  const resetTransform = useCallback(() => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }, [])

  const goPrev = useCallback(() => {
    if (images.length <= 1) return
    setIndex((i) => (i - 1 + images.length) % images.length)
    resetTransform()
  }, [images.length, resetTransform])

  const goNext = useCallback(() => {
    if (images.length <= 1) return
    setIndex((i) => (i + 1) % images.length)
    resetTransform()
  }, [images.length, resetTransform])

  useEffect(() => {
    if (open) {
      setIndex(Math.min(initialIndex, Math.max(images.length - 1, 0)))
      resetTransform()
    }
  }, [open, initialIndex, images.length, resetTransform])

  useEffect(() => {
    if (!open) return

    const preload = (url: string) => {
      const img = new Image()
      img.src = url
    }

    if (index > 0) preload(images[index - 1].url)
    if (index < images.length - 1) preload(images[index + 1].url)
  }, [open, index, images])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }

    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, goPrev, goNext])

  const zoomIn = () => setScale((s) => Math.min(MAX_SCALE, s + 0.5))
  const zoomOut = () => {
    setScale((s) => {
      const next = Math.max(MIN_SCALE, s - 0.5)
      if (next === MIN_SCALE) setOffset({ x: 0, y: 0 })
      return next
    })
  }

  const touchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.hypot(dx, dy)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchStartDistance.current = touchDistance(e.touches)
      pinchStartScale.current = scale
      touchStartX.current = null
      return
    }
    if (e.touches.length === 1 && scale > 1) {
      dragStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        ox: offset.x,
        oy: offset.y,
      }
      return
    }
    if (e.touches.length === 1 && scale === 1) {
      touchStartX.current = e.touches[0].clientX
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistance.current) {
      const dist = touchDistance(e.touches)
      const next = pinchStartScale.current * (dist / pinchStartDistance.current)
      setScale(Math.min(MAX_SCALE, Math.max(MIN_SCALE, next)))
      if (next <= MIN_SCALE) setOffset({ x: 0, y: 0 })
      return
    }
    if (e.touches.length === 1 && dragStart.current && scale > 1) {
      const dx = e.touches[0].clientX - dragStart.current.x
      const dy = e.touches[0].clientY - dragStart.current.y
      setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy })
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    pinchStartDistance.current = null
    dragStart.current = null

    if (scale !== 1 || touchStartX.current === null || e.changedTouches.length === 0) {
      touchStartX.current = null
      return
    }

    const delta = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null

    if (Math.abs(delta) < 50) return
    if (delta > 0) goPrev()
    else goNext()
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) zoomIn()
    else zoomOut()
  }

  if (!open || !current) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex flex-col bg-black/92 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Evidence image preview"
          onClick={onClose}
        >
          <div
            className="flex shrink-0 items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-medium text-white/90">
              {index + 1} of {images.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={zoomOut}
                disabled={scale <= MIN_SCALE}
                className="hidden rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 disabled:opacity-40 sm:inline-flex"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={zoomIn}
                disabled={scale >= MAX_SCALE}
                className="hidden rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 disabled:opacity-40 sm:inline-flex"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={resetTransform}
                className="hidden rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 sm:inline-flex"
                aria-label="Reset zoom"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-white transition-colors hover:bg-white/10"
                aria-label="Close preview"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-[max(1rem,env(safe-area-inset-bottom))]"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            {hasMultiple && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goPrev()
                }}
                className="absolute left-2 z-10 rounded-full bg-black/50 p-2.5 text-white shadow-lg transition-colors hover:bg-black/70 sm:left-4 sm:p-3"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>
            )}

            <motion.img
              key={current.url}
              src={current.url}
              alt={current.alt ?? 'Evidence'}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              draggable={false}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[calc(100vh-8rem)] max-w-full select-none object-contain touch-none"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                transformOrigin: 'center center',
              }}
            />

            {hasMultiple && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goNext()
                }}
                className="absolute right-2 z-10 rounded-full bg-black/50 p-2.5 text-white shadow-lg transition-colors hover:bg-black/70 sm:right-4 sm:p-3"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>
            )}
          </div>

          {hasMultiple && (
            <div className="flex shrink-0 justify-center gap-1.5 pb-4" onClick={(e) => e.stopPropagation()}>
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => {
                    setIndex(i)
                    resetTransform()
                  }}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60',
                  )}
                  aria-label={`View image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
