import { cn } from '@/lib/utils'

interface ArchivedFilterTabsProps {
  value: 'active' | 'archived'
  onChange: (value: 'active' | 'archived') => void
}

export function ArchivedFilterTabs({ value, onChange }: ArchivedFilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {(['active', 'archived'] as const).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
            value === tab
              ? 'bg-gradient-primary text-white shadow-card'
              : 'border border-black/5 bg-white text-ink/60 hover:bg-forest/5',
          )}
        >
          {tab === 'active' ? 'Active' : 'Archived'}
        </button>
      ))}
    </div>
  )
}
