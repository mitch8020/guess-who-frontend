import { apiRequest } from '@/api/client'
import type { ChatMessage } from '@/types/domain'

export interface ChatMessageListResponse {
  items: ChatMessage[]
  nextCursor: string | null
}

export const chatApi = {
  list: (roomId: string, cursor?: string, limit = 50) =>
    apiRequest<ChatMessageListResponse>(
      `/rooms/${roomId}/chat/messages?limit=${limit}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`,
      {
        auth: 'player',
        roomId,
      },
    ),
  send: (roomId: string, message: string) =>
    apiRequest<{ message: ChatMessage }>(`/rooms/${roomId}/chat/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
      auth: 'player',
      roomId,
    }),
}
