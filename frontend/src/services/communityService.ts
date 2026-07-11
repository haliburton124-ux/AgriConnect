import { api } from '@/lib/api'
import type { CommunityCategory, CommunityPost, CommunityPostComment, PaginatedResponse } from '@/types'

export const communityService = {
  categories: () => api.get<{ data: CommunityCategory[] }>('/community/categories'),

  list: (params?: { category?: string; search?: string; municipality_id?: number; page?: number }) =>
    api.get<PaginatedResponse<CommunityPost>>('/community/posts', { params }),

  feed: (params?: { category?: string; search?: string; page?: number }) =>
    api.get<PaginatedResponse<CommunityPost>>('/community/feed', { params }),

  get: (id: number) => api.get<{ data: CommunityPost }>(`/community/posts/${id}`),

  like: (id: number) => api.post<{ message: string; data: CommunityPost }>(`/community/posts/${id}/like`),

  share: (id: number) => api.post<{ message: string; data: CommunityPost }>(`/community/posts/${id}/share`),

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
  }, rolePrefix: 'mao' | 'ppo' | 'admin') =>
    api.post<{ message: string; data: CommunityPost }>(`/${rolePrefix}/community/posts`, payload),

  remove: (id: number, rolePrefix: 'mao' | 'ppo' | 'admin') =>
    api.delete<{ message: string }>(`/${rolePrefix}/community/posts/${id}`),
}
