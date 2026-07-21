export function buildCommunityListParams(options: {
  category?: string | null
  search?: string
}): { category?: string; search?: string } {
  const category = options.category ?? undefined
  const trimmed = options.search?.trim() ?? ''

  if (category) {
    return { category }
  }

  if (trimmed) {
    return { search: trimmed }
  }

  return {}
}
