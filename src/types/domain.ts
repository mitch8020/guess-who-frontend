export type RoomType = 'temporary' | 'permanent'
export type MatchStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled'
export type MatchActionType = 'ask' | 'answer' | 'eliminate' | 'guess' | 'system'

export interface User {
  _id: string
  googleId: string
  email: string
  displayName: string
  avatarUrl?: string
  status: 'active' | 'disabled'
}

export interface RoomSettings {
  allowedBoardSizes: Array<number>
  minPlayers: number
  maxPlayers: number
  allowGuestJoin: boolean
  defaultBoardSize?: number
  rematchBoardSizes?: Array<number>
}

export interface Room {
  _id: string
  name: string
  type: RoomType
  hostUserId: string
  settings: RoomSettings
  temporaryExpiresAt?: string
  lastActivityAt: string
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface RoomMember {
  _id: string
  roomId: string
  userId?: string
  guestSessionId?: string
  displayName: string
  role: 'host' | 'player'
  status: 'active' | 'left' | 'kicked'
  mutedUntil?: string
  joinedAt: string
  lastSeenAt: string
}

export interface Invite {
  _id: string
  roomId: string
  code: string
  allowGuestJoin: boolean
  maxUses?: number
  usesCount: number
  expiresAt?: string
  revokedAt?: string
  createdAt: string
}

export interface RoomImage {
  _id: string
  roomId: string
  uploaderMemberId: string
  storageFileId: string
  filename: string
  mimeType: string
  width: number
  height: number
  fileSizeBytes: number
  sha256: string
  isActive: boolean
  createdAt: string
}

export interface MatchParticipantView {
  roomMemberId: string
  boardImageOrder: Array<string>
  secretTargetImageId: string
  eliminatedImageIds: Array<string>
  result: 'in_progress' | 'guessed_correct' | 'guessed_wrong' | 'timeout'
}

export interface Match {
  _id: string
  roomId: string
  status: MatchStatus
  boardSize: number
  selectedImageIds: Array<string>
  startedByMemberId: string
  turnMemberId?: string
  winnerMemberId?: string
  randomizationSeedHash: string
  startedAt: string
  endedAt?: string
  createdAt: string
  updatedAt: string
  participants: Array<{
    roomMemberId: string
    eliminatedImageIds: Array<string>
    result: 'in_progress' | 'guessed_correct' | 'guessed_wrong' | 'timeout'
    readyAt: string
    lastActionAt: string
  }>
}

export interface MatchAction {
  _id: string
  matchId: string
  actorMemberId?: string
  actionType: MatchActionType
  payload: Record<string, unknown>
  createdAt: string
}

export interface ChatMessage {
  _id: string
  roomId: string
  memberId: string
  message: string
  createdAt: string
}

export interface MatchHistoryItem {
  matchId: string
  roomId: string
  status: MatchStatus
  boardSize: number
  winnerMemberId?: string
  startedAt: string
  endedAt?: string
  createdAt: string
}

export interface MatchReplayFrame {
  actionId: string
  actionType: MatchActionType
  actorMemberId?: string
  payload: Record<string, unknown>
  createdAt: string
}
