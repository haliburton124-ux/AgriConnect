import { useRef, useEffect } from 'react'
import {
  Search, ArrowLeft, Clock, X, ChevronRight,
} from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { ADVISORY_CATEGORIES } from '@/lib/advisoryCategories'
import { useAdvisoryRecentSearches } from '@/hooks/useAdvisoryRecentSearches'
import { cn } from '@/lib/utils'

interface AdvisorySearchPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  search: string
  onSearchChange: (value: string) => void
  activeCategory: string | null
  onCategoryChange: (category: string | null) => void
}

export function AdvisorySearchPanel({
  open,
  onOpenChange,
  search,
  onSearchChange,
  activeCategory,
  onCategoryChange,
}: AdvisorySearchPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { recent, addRecent, removeRecent, clearRecent } = useAdvisoryRecentSearches()

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [open])

  const commitSearch = (term: string) => {
    const trimmed = term.trim()
    onSearchChange(trimmed)
    if (trimmed) addRecent(trimmed)
    inputRef.current?.blur()
    onOpenChange(false)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    commitSearch(search)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className="flex w-full items-center gap-3 rounded-xl border border-black/5 bg-canvas px-4 py-3 text-left transition-colors hover:bg-forest/[0.04]"
      >
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className={cn('text-sm', search || activeCategory ? 'font-medium text-ink' : 'text-muted-foreground')}>
          {search
            ? `"${search}"`
            : activeCategory
              ? ADVISORY_CATEGORIES.find((c) => c.value === activeCategory)?.label ?? 'Filtered'
              : 'Search advisories…'}
        </span>
      </button>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-black/[0.03]">
      {/* Search header */}
      <div className="flex items-center gap-2 border-b border-black/5 px-3 py-3">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-forest/5"
          aria-label="Close search"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <form className="relative flex-1" onSubmit={handleSubmit}>
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            enterKeyHint="search"
            placeholder="Search advisories…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="border-0 bg-canvas pl-9 shadow-none ring-0 focus-visible:ring-0 [&::-webkit-search-cancel-button]:hidden"
          />
        </form>
      </div>

      {/* Recent searches */}
      {recent.length > 0 && (
        <div className="border-b border-black/5 px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Recent Searches</h3>
            <button
              type="button"
              onClick={clearRecent}
              className="text-xs font-semibold text-forest hover:underline"
            >
              Clear all
            </button>
          </div>
          <ul className="space-y-1">
            {recent.map((term) => (
              <li key={term} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => commitSearch(term)}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-forest/[0.04]"
                >
                  <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm text-ink">{term}</span>
                </button>
                <button
                  type="button"
                  onClick={() => removeRecent(term)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-black/5 hover:text-ink"
                  aria-label={`Remove ${term}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Browse categories */}
      <div className="px-4 py-4">
        <h3 className="text-sm font-semibold text-ink">Browse Categories</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">Explore advisories by topic</p>
        <ul className="mt-3 space-y-0.5">
          {ADVISORY_CATEGORIES.map(({ value, label, icon: Icon }) => {
            const selected = activeCategory === value || (value === null && activeCategory === null)
            return (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => onCategoryChange(value)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors',
                    selected ? 'bg-forest/[0.08] text-forest' : 'hover:bg-forest/[0.04]',
                  )}
                >
                  <span className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                    selected ? 'bg-forest/15 text-forest' : 'bg-forest/[0.06] text-forest',
                  )}
                >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-sm font-medium text-ink">{label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
