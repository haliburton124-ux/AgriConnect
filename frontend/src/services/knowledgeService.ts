import { api } from '@/lib/api'
import type { KnowledgeArticle, KnowledgeCategory, PaginatedResponse } from '@/types'

export interface KnowledgeArticlePayload {
  title: string
  content: string
  category_id?: number
  type?: KnowledgeArticle['type']
  video_url?: string
  is_published?: boolean
  published_at?: string
  cover_image?: File
  pdf_file?: File
  images?: File[]
  attachments?: File[]
}

function toFormData(payload: KnowledgeArticlePayload): FormData {
  const form = new FormData()
  form.append('title', payload.title)
  form.append('content', payload.content)
  form.append('type', payload.type ?? 'article')
  form.append('is_published', payload.is_published === false ? '0' : '1')
  if (payload.category_id) form.append('category_id', String(payload.category_id))
  if (payload.video_url) form.append('video_url', payload.video_url)
  if (payload.published_at) form.append('published_at', payload.published_at)
  if (payload.cover_image) form.append('cover_image', payload.cover_image)
  if (payload.pdf_file) form.append('pdf_file', payload.pdf_file)
  payload.images?.forEach((file) => form.append('images[]', file))
  payload.attachments?.forEach((file) => form.append('attachments[]', file))
  return form
}

export const knowledgeService = {
  categories: () => api.get<{ data: KnowledgeCategory[] }>('/knowledge/categories'),
  list: (params?: { category_id?: number; type?: string; search?: string }) =>
    api.get<PaginatedResponse<KnowledgeArticle>>('/knowledge/articles', { params }),
  get: (id: number) => api.get<{ data: KnowledgeArticle }>(`/knowledge/articles/${id}`),
  manage: (params?: { search?: string; category_id?: number; archived?: boolean }) =>
    api.get<PaginatedResponse<KnowledgeArticle>>('/mao/knowledge/articles', {
      params: { ...params, archived: params?.archived ? 1 : undefined },
    }),
  create: (payload: KnowledgeArticlePayload) =>
    api.post<{ message: string; data: KnowledgeArticle }>('/knowledge/articles', toFormData(payload)),
  archive: (id: number) => api.post(`/knowledge/articles/${id}/archive`),
  restore: (id: number) => api.post(`/knowledge/articles/${id}/restore`),
}
