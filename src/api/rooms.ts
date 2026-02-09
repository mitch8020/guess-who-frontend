import { apiRequest } from '@/api/client'
import type { Room, RoomMember } from '@/types/domain'

export interface CreateRoomPayload {
  name: string
  type: 'temporary' | 'permanent'
  settings?: {
    allowedBoardSizes?: number[]
    maxPlayers?: number
    allowGuestJoin?: boolean
  }
}

export interface UpdateRoomPayload {
  name?: string
  settings?: {
    allowedBoardSizes?: number[]
    maxPlayers?: number
    allowGuestJoin?: boolean
  }
}

export const roomsApi = {
  list: () => apiRequest<{ rooms: Room[] }>('/rooms', { auth: 'user' }),
  create: (payload: CreateRoomPayload) =>
    apiRequest<{
      room: Room
      hostMember: RoomMember
    }>('/rooms', {
      method: 'POST',
      body: JSON.stringify(payload),
      auth: 'user',
    }),
  detail: (roomId: string) =>
    apiRequest<{
      room: Room
      member: RoomMember
      members: RoomMember[]
    }>(`/rooms/${roomId}`, {
      auth: 'player',
      roomId,
    }),
  update: (roomId: string, payload: UpdateRoomPayload) =>
    apiRequest<{ room: Room }>(`/rooms/${roomId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      auth: 'user',
    }),
  archive: (roomId: string) =>
    apiRequest<void>(`/rooms/${roomId}`, {
      method: 'DELETE',
      auth: 'user',
    }),
  removeMember: (roomId: string, memberId: string) =>
    apiRequest<{ members: RoomMember[] }>(`/rooms/${roomId}/members/remove`, {
      method: 'POST',
      body: JSON.stringify({ memberId }),
      auth: 'user',
    }),
}
