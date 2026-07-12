import { useCallback, useState } from 'react'

const STORAGE_KEY = 'agriri_advisory_recent_searches'
const MAX_RECENT = 8

export function useAdvisoryRecentSearches() {
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as string[]) : []
    } catch {
      return []
    }
  })

  const persist = useCallback((items: string[]) => {
    setRecent(items)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [])

  const addRecent = useCallback(
    (term: string) => {
      const trimmed = term.trim()
      if (!trimmed) return
      const next = [trimmed, ...recent.filter((r) => r.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_RECENT)
      persist(next)
    },
    [recent, persist],
  )

  const removeRecent = useCallback(
    (term: string) => {
      persist(recent.filter((r) => r !== term))
    },
    [recent, persist],
  )

  const clearRecent = useCallback(() => persist([]), [persist])

  return { recent, addRecent, removeRecent, clearRecent }
}
