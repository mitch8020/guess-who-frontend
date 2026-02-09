import { apiRequest } from '@/api/client'
import type {
  Match,
  MatchAction,
  MatchHistoryItem,
  MatchParticipantView,
  MatchReplayFrame,
} from '@/types/domain'

export interface MatchDetailResponse {
  match: Match
  participantState: MatchParticipantView | null
  actions: MatchAction[]
}

export interface MatchHistoryResponse {
  items: MatchHistoryItem[]
  nextCursor: string | null
}

export interface MatchReplayResponse {
  matchId: string
  frames: MatchReplayFrame[]
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
  history: (roomId: string, cursor?: string, limit = 20) =>
    apiRequest<MatchHistoryResponse>(
      `/rooms/${roomId}/matches/history?limit=${limit}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`,
      {
        auth: 'player',
        roomId,
      },
    ),
  replay: (roomId: string, matchId: string) =>
    apiRequest<MatchReplayResponse>(`/rooms/${roomId}/matches/${matchId}/replay`, {
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
