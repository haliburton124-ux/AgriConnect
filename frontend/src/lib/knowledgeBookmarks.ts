const STORAGE_KEY = 'agriri_knowledge_bookmarks'

export function getKnowledgeBookmarks(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

export function toggleKnowledgeBookmark(id: string): boolean {
  const bookmarks = getKnowledgeBookmarks()
  if (bookmarks.has(id)) {
    bookmarks.delete(id)
  } else {
    bookmarks.add(id)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...bookmarks]))
  return bookmarks.has(id)
}

export function isKnowledgeBookmarked(id: string): boolean {
  return getKnowledgeBookmarks().has(id)
}
