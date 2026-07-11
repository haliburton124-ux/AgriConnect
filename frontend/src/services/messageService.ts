import { api } from '@/lib/api'
import type { MessageThread, ChatMessage, PaginatedResponse } from '@/types'

export const messageService = {
  threads: () => api.get<{ data: MessageThread[] }>('/messages/threads'),
  conversation: (partnerId: number) => api.get<PaginatedResponse<ChatMessage>>(`/messages/${partnerId}`),
  send: (receiverId: number, body: string, incidentId?: number) =>
    api.post<{ message: string; data: ChatMessage }>('/messages', { receiver_id: receiverId, body, incident_id: incidentId }),
}
