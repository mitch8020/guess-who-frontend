import { apiRequest } from '@/api/client'
import type { Match, MatchAction, MatchParticipantView } from '@/types/domain'

export interface MatchDetailResponse {
  match: Match
  participantState: MatchParticipantView | null
  actions: MatchAction[]
}

export const matchesApi = {
  start: (roomId: string, payload: { boardSize: number; opponentMemberId: string }) =>
    apiRequest<MatchDetailResponse>(`/rooms/${roomId}/matches`, {
      method: 'POST',
      body: JSON.stringify(payload),
      auth: 'player',
      roomId,
    }),
  detail: (roomId: string, matchId: string) =>
    apiRequest<MatchDetailResponse>(`/rooms/${roomId}/matches/${matchId}`, {
      auth: 'player',
      roomId,
    }),
  action: (
    roomId: string,
    matchId: string,
    payload: { actionType: 'ask' | 'answer' | 'eliminate' | 'guess'; payload?: Record<string, unknown> },
  ) =>
    apiRequest<MatchDetailResponse>(`/rooms/${roomId}/matches/${matchId}/actions`, {
      method: 'POST',
      body: JSON.stringify(payload),
      auth: 'player',
      roomId,
    }),
  forfeit: (roomId: string, matchId: string) =>
    apiRequest<MatchDetailResponse>(`/rooms/${roomId}/matches/${matchId}/forfeit`, {
      method: 'POST',
      auth: 'player',
      roomId,
    }),
  rematch: (roomId: string, matchId: string, boardSize?: number) =>
    apiRequest<MatchDetailResponse>(`/rooms/${roomId}/matches/${matchId}/rematch`, {
      method: 'POST',
      body: JSON.stringify({ boardSize }),
      auth: 'player',
      roomId,
    }),
}
