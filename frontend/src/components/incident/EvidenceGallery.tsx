import { useMemo, useState } from 'react'
import { Play } from 'lucide-react'
import { EvidenceLightbox, type EvidenceImage } from '@/components/ui/EvidenceLightbox'
import type { IncidentMedia } from '@/types'

interface EvidenceGalleryProps {
  media: IncidentMedia[]
  className?: string
}

/**
 * Thumbnail grid for incident evidence. Photos open an in-app lightbox;
 * videos open in a new tab (no inline player required for this flow).
 */
export function EvidenceGallery({ media, className }: EvidenceGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [startIndex, setStartIndex] = useState(0)

  const photos = useMemo(
    () => media.filter((m) => m.type === 'photo'),
    [media],
  )

  const lightboxImages: EvidenceImage[] = useMemo(
    () => photos.map((m) => ({ id: m.id, url: m.url, alt: 'Incident evidence' })),
    [photos],
  )

  const openLightbox = (photoIndex: number) => {
    setStartIndex(photoIndex)
    setLightboxOpen(true)
  }

  if (media.length === 0) return null

  let photoCursor = 0

  return (
    <>
      <div className={className ?? 'grid grid-cols-3 gap-2 sm:grid-cols-4'}>
        {media.map((m) => {
          if (m.type === 'photo') {
            const photoIndex = photoCursor
            photoCursor += 1
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => openLightbox(photoIndex)}
                className="group block overflow-hidden rounded-lg border border-black/5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
              >
                <img
                  src={m.url}
                  alt="Incident evidence"
                  className="h-20 w-full object-cover transition-transform group-hover:scale-105"
                />
              </button>
            )
          }

          return (
            <a
              key={m.id}
              href={m.url}
              target="_blank"
              rel="noreferrer"
              className="flex h-20 w-full items-center justify-center gap-1.5 rounded-lg border border-black/5 bg-ink/5 text-xs text-muted-foreground transition-colors hover:bg-ink/10"
            >
              <Play className="h-4 w-4" /> Video
            </a>
          )
        })}
      </div>

      <EvidenceLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={lightboxImages}
        initialIndex={startIndex}
      />
    </>
  )
}
