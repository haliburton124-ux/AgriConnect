import { Search } from 'lucide-react'
import { KNOWLEDGE_IMAGES, formatMunicipalityLocation } from '@/lib/knowledgeCenterConfig'
import { cn } from '@/lib/utils'

interface KnowledgeCenterHeroProps {
  municipalityName?: string | null
  search: string
  onSearchChange: (value: string) => void
  className?: string
}

export function KnowledgeCenterHero({
  municipalityName,
  search,
  onSearchChange,
  className,
}: KnowledgeCenterHeroProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden bg-gradient-to-br from-forest-dark via-forest to-forest-light',
        className,
      )}
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${KNOWLEDGE_IMAGES.hero})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-forest-dark/95 via-forest/85 to-forest/40" />

      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Knowledge Center
            </h1>
            <p className="mt-2 text-lg font-semibold text-white/90">
              {formatMunicipalityLocation(municipalityName)}
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80">
              Access trusted agricultural information, practical farming guides, advisories, and
              learning materials to help improve your farm.
            </p>

            <div className="relative mt-8 max-w-2xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/40" />
              <input
                type="search"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search agricultural information…"
                className="h-14 w-full rounded-2xl border-0 bg-white pl-12 pr-4 text-base text-ink shadow-glass placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
              />
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-3xl border-4 border-white/20 shadow-glass">
              <img
                src={KNOWLEDGE_IMAGES.farmer}
                alt="Farmer using agricultural technology"
                className="h-72 w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
