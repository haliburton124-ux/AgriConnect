import { cn } from '@/lib/utils'
import type { QuickCategory, QuickCategoryKey } from '@/lib/knowledgeCenterConfig'

interface QuickAccessCategoriesProps {
  categories: QuickCategory[]
  activeKey: QuickCategoryKey | null
  onSelect: (key: QuickCategoryKey) => void
}

export function QuickAccessCategories({ categories, activeKey, onSelect }: QuickAccessCategoriesProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {categories.map((category) => {
          const Icon = category.icon
          const isActive = activeKey === category.key
          return (
            <button
              key={category.key}
              type="button"
              onClick={() => onSelect(category.key)}
              className={cn(
                'group flex flex-col rounded-2xl border bg-white p-5 text-left shadow-soft transition-all hover:-translate-y-1 hover:shadow-glass',
                isActive ? 'border-forest ring-2 ring-forest/20' : 'border-black/5',
              )}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest/10 text-forest transition-colors group-hover:bg-forest group-hover:text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-ink">{category.title}</h3>
              <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                {category.description}
              </p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
