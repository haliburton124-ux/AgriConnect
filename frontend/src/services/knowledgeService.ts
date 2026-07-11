import { api } from '@/lib/api'
import type { KnowledgeArticle, KnowledgeCategory, PaginatedResponse } from '@/types'

export const knowledgeService = {
  categories: () => api.get<{ data: KnowledgeCategory[] }>('/knowledge/categories'),
  list: (params?: { category_id?: number; type?: string; search?: string }) =>
    api.get<PaginatedResponse<KnowledgeArticle>>('/knowledge/articles', { params }),
  get: (id: number) => api.get<{ data: KnowledgeArticle }>(`/knowledge/articles/${id}`),
}
