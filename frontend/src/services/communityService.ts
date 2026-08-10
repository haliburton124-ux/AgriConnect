import { api } from '@/lib/api'
import type { CommunityCategory, CommunityPost, CommunityPostComment, PaginatedResponse } from '@/types'

export const communityService = {
  categories: () => api.get<{ data: CommunityCategory[] }>('/community/categories'),

  list: (params?: { category?: string; search?: string; municipality_id?: number; page?: number; archived?: boolean }) =>
    api.get<PaginatedResponse<CommunityPost>>('/community/posts', {
      params: {
        ...params,
        archived: params?.archived ? 1 : undefined,
      },
    }),

  feed: (params?: { category?: string; search?: string; page?: number }) =>
    api.get<PaginatedResponse<CommunityPost>>('/community/feed', { params }),

  get: (id: number, params?: { share_id?: number }) =>
    api.get<{ data: CommunityPost }>(`/community/posts/${id}`, { params }),

  like: (id: number) => api.post<{ message: string; data: CommunityPost }>(`/community/posts/${id}/like`),

  share: (id: number, caption?: string) =>
    api.post<{ message: string; data: CommunityPost }>(`/community/posts/${id}/share`, {
      caption: caption ?? null,
    }),

  comments: (id: number) => api.get<{ data: CommunityPostComment[] }>(`/community/posts/${id}/comments`),

  addComment: (id: number, body: string, parentId?: number) =>
    api.post<{ message: string; data: CommunityPostComment }>(`/community/posts/${id}/comments`, {
      body,
      parent_id: parentId,
    }),

  create: (payload: {
    title: string
    content: string
    category: string
    is_published?: boolean
    municipality_id?: number
    image?: File
    images?: File[]
  }, rolePrefix: 'mao' | 'ppo' | 'admin') => {
    const files = payload.images?.length ? payload.images : payload.image ? [payload.image] : []

    if (files.length > 0) {
      const formData = new FormData()
      formData.append('title', payload.title)
      formData.append('content', payload.content)
      formData.append('category', payload.category)
      formData.append('is_published', payload.is_published !== false ? '1' : '0')
      if (payload.municipality_id != null) {
        formData.append('municipality_id', String(payload.municipality_id))
      }
      files.forEach((file) => formData.append('images[]', file))
      return api.post<{ message: string; data: CommunityPost }>(`/${rolePrefix}/community/posts`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    const { image: _, images: __, ...jsonPayload } = payload
    return api.post<{ message: string; data: CommunityPost }>(`/${rolePrefix}/community/posts`, jsonPayload)
  },

  archive: (id: number, rolePrefix: 'mao' | 'ppo' | 'admin') =>
    api.post<{ message: string }>(`/${rolePrefix}/community/posts/${id}/archive`),
  restore: (id: number, rolePrefix: 'mao' | 'ppo' | 'admin') =>
    api.post<{ message: string }>(`/${rolePrefix}/community/posts/${id}/restore`),
}
