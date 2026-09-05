import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TopicItem } from '@/lib/knowledgeCenterConfig'

interface BrowseByTopicSectionProps {
  topics: TopicItem[]
  counts: Record<string, number>
  activeTopic: string | null
  page: number
  pageSize: number
  onSelectTopic: (slug: string) => void
  onPageChange: (page: number) => void
}

export function BrowseByTopicSection({
  topics,
  counts,
  activeTopic,
  page,
  pageSize,
  onSelectTopic,
  onPageChange,
}: BrowseByTopicSectionProps) {
  const totalPages = Math.max(1, Math.ceil(topics.length / pageSize))
  const visible = topics.slice(page * pageSize, page * pageSize + pageSize)

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <h2 className="mb-6 text-xl font-bold text-ink sm:text-2xl">Browse by Topic</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((topic) => (
          <button
            key={topic.slug}
            type="button"
            onClick={() => onSelectTopic(topic.slug)}
            className={cn(
              'flex items-center justify-between rounded-xl border bg-white px-4 py-4 text-left shadow-soft transition-all hover:border-forest/30 hover:shadow-card',
              activeTopic === topic.slug ? 'border-forest ring-2 ring-forest/15' : 'border-black/5',
            )}
          >
            <div>
              <p className="font-semibold text-ink">{topic.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {counts[topic.slug] ?? 0} resources
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-ink/70 transition-colors hover:border-forest/30 hover:text-forest disabled:opacity-40"
            aria-label="Previous topics"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-ink/70 transition-colors hover:border-forest/30 hover:text-forest disabled:opacity-40"
            aria-label="Next topics"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        {page < totalPages - 1 && (
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest hover:underline"
          >
            View All Topics
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </section>
  )
}
