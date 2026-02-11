import type { Invite, Room, RoomMember } from '@/types/domain'
import { apiRequest } from '@/api/client'

export const invitesApi = {
  create: (roomId: string, payload?: { allowGuestJoin?: boolean; maxUses?: number }) =>
    apiRequest<{
      invite: Invite
      shareUrl: string
    }>(`/rooms/${roomId}/invites`, {
      method: 'POST',
      body: JSON.stringify(payload ?? {}),
      auth: 'player',
      roomId,
    }),
  resolve: (code: string) =>
    apiRequest<{
      invite: Pick<Invite, '_id' | 'code' | 'allowGuestJoin' | 'maxUses' | 'usesCount' | 'expiresAt'>
      room: Pick<Room, '_id' | 'name' | 'type'>
    }>(`/invites/${code}`, {
      auth: 'none',
    }),
  join: (code: string, payload: { displayName: string }, asAuthenticatedUser: boolean) =>
    apiRequest<{
      member: RoomMember
      guestToken?: string
      room: Room
    }>(`/invites/${code}/join`, {
      method: 'POST',
      body: JSON.stringify(payload),
      auth: asAuthenticatedUser ? 'user' : 'none',
    }),
  revoke: (roomId: string, inviteId: string) =>
    apiRequest<{ invite: Invite }>(`/rooms/${roomId}/invites/${inviteId}/revoke`, {
      method: 'POST',
      auth: 'user',
    }),
}
