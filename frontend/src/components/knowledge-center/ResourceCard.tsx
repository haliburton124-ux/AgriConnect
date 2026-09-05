import { Bookmark, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { KnowledgeResource } from '@/lib/knowledgeResources'

interface ResourceCardProps {
  resource: KnowledgeResource
  bookmarked: boolean
  onOpen: () => void
  onToggleBookmark: () => void
  variant?: 'featured' | 'learning'
}

function TypeBadge({ resource, variant }: { resource: KnowledgeResource; variant: 'featured' | 'learning' }) {
  const label = variant === 'learning'
    ? resource.type === 'video'
      ? 'Video'
      : resource.type === 'infographic'
        ? 'Infographic'
        : resource.type === 'pdf_guide'
          ? 'PDF Guide'
          : resource.categoryLabel
    : resource.categoryLabel

  return (
    <span className="absolute left-3 top-3 rounded-full bg-forest px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
      {label}
    </span>
  )
}

export function ResourceCard({
  resource,
  bookmarked,
  onOpen,
  onToggleBookmark,
  variant = 'featured',
}: ResourceCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-soft transition-all hover:-translate-y-1 hover:shadow-glass">
      <button type="button" onClick={onOpen} className="relative block text-left">
        <div className="relative aspect-[16/10] overflow-hidden bg-forest/5">
          <img
            src={resource.imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <TypeBadge resource={resource} variant={variant} />
          {variant === 'learning' && resource.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-forest shadow-card">
                <Play className="h-5 w-5 fill-forest" />
              </div>
            </div>
          )}
        </div>
      </button>

      <div className="flex flex-1 flex-col p-5">
        <button type="button" onClick={onOpen} className="text-left">
          <h3 className="line-clamp-2 font-semibold text-ink group-hover:text-forest">{resource.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {resource.description}
          </p>
        </button>

        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="text-xs text-muted-foreground">
            {resource.duration ?? resource.fileSize ?? resource.date}
            {resource.viewCount != null && ` · ${resource.viewCount} views`}
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleBookmark() }}
            className={cn(
              'rounded-lg p-2 transition-colors hover:bg-forest/5',
              bookmarked ? 'text-forest' : 'text-muted-foreground',
            )}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark resource'}
          >
            <Bookmark className={cn('h-4 w-4', bookmarked && 'fill-current')} />
          </button>
        </div>
      </div>
    </article>
  )
}

interface ResourceSectionProps {
  title: string
  resources: KnowledgeResource[]
  bookmarkedIds: Set<string>
  onOpen: (resource: KnowledgeResource) => void
  onToggleBookmark: (id: string) => void
  onViewAll?: () => void
  variant?: 'featured' | 'learning'
  id?: string
  emptyMessage?: string
}

export function ResourceSection({
  title,
  resources,
  bookmarkedIds,
  onOpen,
  onToggleBookmark,
  onViewAll,
  variant = 'featured',
  id,
  emptyMessage = 'No resources in this section yet.',
}: ResourceSectionProps) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-ink sm:text-2xl">{title}</h2>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="shrink-0 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-ink/70 transition-colors hover:border-forest/30 hover:text-forest"
          >
            View All
          </button>
        )}
      </div>

      {resources.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-forest/20 bg-white px-6 py-12 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            bookmarked={bookmarkedIds.has(resource.id)}
            onOpen={() => onOpen(resource)}
            onToggleBookmark={() => onToggleBookmark(resource.id)}
            variant={variant}
          />
        ))}
      </div>
      )}
    </section>
  )
}
