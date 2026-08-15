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

  get: (id: number) => api.get<{ data: CommunityPost }>(`/community/posts/${id}`),

  like: (id: number) => api.post<{ message: string; data: CommunityPost }>(`/community/posts/${id}/like`),

  share: (id: number) => api.post<{ message: string; data: CommunityPost }>(`/community/posts/${id}/share`),

  comments: (id: number) => api.get<{ data: CommunityPostComment[] }>(`/community/posts/${id}/comments`),

  addComment: (id: number, body: string, parentId?: number, image?: File) => {
    if (image) {
      const formData = new FormData()
      formData.append('body', body)
      if (parentId != null) {
        formData.append('parent_id', String(parentId))
      }
      formData.append('image', image)
      return api.post<{ message: string; data: CommunityPostComment }>(`/community/posts/${id}/comments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    return api.post<{ message: string; data: CommunityPostComment }>(`/community/posts/${id}/comments`, {
      body,
      parent_id: parentId,
    })
  },

  create: (payload: {
    title: string
    content: string
    category: string
    is_published?: boolean
    municipality_id?: number
    image?: File
  }, rolePrefix: 'mao' | 'ppo' | 'admin') => {
    if (payload.image) {
      const formData = new FormData()
      formData.append('title', payload.title)
      formData.append('content', payload.content)
      formData.append('category', payload.category)
      formData.append('is_published', payload.is_published !== false ? '1' : '0')
      if (payload.municipality_id != null) {
        formData.append('municipality_id', String(payload.municipality_id))
      }
      formData.append('image', payload.image)
      return api.post<{ message: string; data: CommunityPost }>(`/${rolePrefix}/community/posts`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    const { image: _, ...jsonPayload } = payload
    return api.post<{ message: string; data: CommunityPost }>(`/${rolePrefix}/community/posts`, jsonPayload)
  },

  archive: (id: number, rolePrefix: 'mao' | 'ppo' | 'admin') =>
    api.post<{ message: string }>(`/${rolePrefix}/community/posts/${id}/archive`),
  restore: (id: number, rolePrefix: 'mao' | 'ppo' | 'admin') =>
    api.post<{ message: string }>(`/${rolePrefix}/community/posts/${id}/restore`),
}
