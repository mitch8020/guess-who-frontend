import type { ChatMessage } from '@/types/domain'
import { apiRequest } from '@/api/client'

export interface ChatMessageListResponse {
  items: Array<ChatMessage>
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
