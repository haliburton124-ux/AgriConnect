import { useMemo, useState } from 'react'
import { EvidenceLightbox } from '@/components/ui/EvidenceLightbox'
import { cn, storageUrl } from '@/lib/utils'

function resolveImageUrl(path: string): string {
  if (path.startsWith('blob:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  return storageUrl(path)
}

export interface PostPhotoGridProps {
  paths: string[]
  variant?: 'compact' | 'detail'
  className?: string
  onClick?: () => void
  enableLightbox?: boolean
}

function GridCell({
  path,
  className,
  overlay,
  onClick,
}: {
  path: string
  className?: string
  overlay?: React.ReactNode
  onClick?: (event: React.MouseEvent) => void
}) {
  return (
    <div
      className={cn('relative min-h-0 min-w-0 overflow-hidden bg-black/[0.04]', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <img
        src={resolveImageUrl(path)}
        alt=""
        className="block h-full w-full object-cover"
        draggable={false}
      />
      {overlay}
    </div>
  )
}

export function PostPhotoGrid({
  paths,
  variant = 'compact',
  className,
  onClick,
  enableLightbox = false,
}: PostPhotoGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const count = paths.length
  const isCompact = variant === 'compact'
  const gridHeight = isCompact ? 'h-56 sm:h-64' : 'h-72 sm:h-96'

  const lightboxImages = useMemo(
    () => paths.map((path, index) => ({ id: index, url: resolveImageUrl(path), alt: 'Post photo' })),
    [paths],
  )

  if (count === 0) return null

  const openLightbox = (index: number, event: React.MouseEvent) => {
    if (!enableLightbox) return
    event.stopPropagation()
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const wrapperClass = cn(
    'overflow-hidden rounded-xl border border-black/5',
    onClick && 'cursor-pointer',
    className,
  )

  const handleWrapperClick = () => {
    onClick?.()
  }

  // 1 photo — natural aspect ratio, no forced crop
  if (count === 1) {
    return (
      <>
        <div
          className={wrapperClass}
          onClick={handleWrapperClick}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          onKeyDown={onClick ? (e) => e.key === 'Enter' && handleWrapperClick() : undefined}
        >
          <img
            src={resolveImageUrl(paths[0])}
            alt=""
            className={cn(
              'block w-full',
              isCompact ? 'max-h-80' : 'max-h-[32rem]',
            )}
            draggable={false}
            onClick={enableLightbox ? (e) => openLightbox(0, e) : undefined}
          />
        </div>
        {enableLightbox && (
          <EvidenceLightbox
            open={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            images={lightboxImages}
            initialIndex={lightboxIndex}
          />
        )}
      </>
    )
  }

  const remaining = count > 4 ? count - 4 : 0
  const visible = remaining > 0 ? paths.slice(0, 4) : paths

  const gridContent = (() => {
    // 2 photos — side-by-side
    if (count === 2) {
      return (
        <div className={cn('grid grid-cols-2 gap-0.5', gridHeight)}>
          {visible.map((path, index) => (
            <GridCell
              key={path}
              path={path}
              onClick={enableLightbox ? (e) => openLightbox(index, e) : undefined}
            />
          ))}
        </div>
      )
    }

    // 3 photos — large left + two stacked right (Facebook-style)
    if (count === 3) {
      return (
        <div className={cn('grid grid-cols-2 grid-rows-2 gap-0.5', gridHeight)}>
          <GridCell
            path={visible[0]}
            className="row-span-2"
            onClick={enableLightbox ? (e) => openLightbox(0, e) : undefined}
          />
          <GridCell
            path={visible[1]}
            onClick={enableLightbox ? (e) => openLightbox(1, e) : undefined}
          />
          <GridCell
            path={visible[2]}
            onClick={enableLightbox ? (e) => openLightbox(2, e) : undefined}
          />
        </div>
      )
    }

    // 4+ photos — 2×2 grid with +N overlay on 4th when more remain
    return (
      <div className={cn('grid grid-cols-2 grid-rows-2 gap-0.5', gridHeight)}>
        {visible.map((path, index) => (
          <GridCell
            key={`${path}-${index}`}
            path={path}
            onClick={enableLightbox ? (e) => openLightbox(index, e) : undefined}
            overlay={
              index === 3 && remaining > 0 ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="text-2xl font-semibold text-white sm:text-3xl">+{remaining}</span>
                </div>
              ) : undefined
            }
          />
        ))}
      </div>
    )
  })()

  return (
    <>
      <div
        className={wrapperClass}
        onClick={handleWrapperClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => e.key === 'Enter' && handleWrapperClick() : undefined}
      >
        {gridContent}
      </div>
      {enableLightbox && (
        <EvidenceLightbox
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          images={lightboxImages}
          initialIndex={lightboxIndex}
        />
      )}
    </>
  )
}
