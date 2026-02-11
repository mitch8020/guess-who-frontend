import type { Room, RoomMember } from '@/types/domain'
import { apiRequest } from '@/api/client'

export interface CreateRoomPayload {
  name: string
  type: 'temporary' | 'permanent'
  settings?: {
    allowedBoardSizes?: Array<number>
    maxPlayers?: number
    allowGuestJoin?: boolean
    defaultBoardSize?: number
    rematchBoardSizes?: Array<number>
  }
}

export interface UpdateRoomPayload {
  name?: string
  settings?: {
    allowedBoardSizes?: Array<number>
    maxPlayers?: number
    allowGuestJoin?: boolean
    defaultBoardSize?: number
    rematchBoardSizes?: Array<number>
  }
}

export const roomsApi = {
  list: () => apiRequest<{ rooms: Array<Room> }>('/rooms', { auth: 'user' }),
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
      members: Array<RoomMember>
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
    apiRequest<{ members: Array<RoomMember> }>(`/rooms/${roomId}/members/remove`, {
      method: 'POST',
      body: JSON.stringify({ memberId }),
      auth: 'user',
    }),
  muteMember: (roomId: string, memberId: string, durationMinutes = 30) =>
    apiRequest<{ member: RoomMember }>(`/rooms/${roomId}/members/${memberId}/mute`, {
      method: 'POST',
      body: JSON.stringify({ durationMinutes }),
      auth: 'user',
    }),
  unmuteMember: (roomId: string, memberId: string) =>
    apiRequest<{ member: RoomMember }>(`/rooms/${roomId}/members/${memberId}/unmute`, {
      method: 'POST',
      auth: 'user',
    }),
}
