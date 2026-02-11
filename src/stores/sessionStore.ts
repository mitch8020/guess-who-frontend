import type { User } from '@/types/domain'

export interface SessionState {
  accessToken: string | null
  user: User | null
  guestTokensByRoomId: Record<string, string>
}

const defaultState: SessionState = {
  accessToken: null,
  user: null,
  guestTokensByRoomId: {},
}

const subscribers = new Set<() => void>()
let state: SessionState = { ...defaultState }

const emit = () => {
  for (const subscriber of subscribers) {
    subscriber()
  }
}

export const sessionStore = {
  getState: () => state,
  subscribe: (callback: () => void) => {
    subscribers.add(callback)
    return () => subscribers.delete(callback)
  },
  setState: (nextState: SessionState) => {
    state = nextState
    emit()
  },
  setSession: (payload: {
    accessToken: string
    user: User
  }) => {
    state = {
      ...state,
      accessToken: payload.accessToken,
      user: payload.user,
    }
    emit()
  },
  clearUserSession: () => {
    state = {
      ...state,
      accessToken: null,
      user: null,
    }
    emit()
  },
  setUser: (user: User | null) => {
    state = {
      ...state,
      user,
    }
    emit()
  },
  setGuestToken: (roomId: string, token: string) => {
    state = {
      ...state,
      guestTokensByRoomId: {
        ...state.guestTokensByRoomId,
        [roomId]: token,
      },
    }
    emit()
  },
  getPlayerToken: (roomId?: string): string | null => {
    if (state.accessToken) {
      return state.accessToken
    }
    if (roomId) {
      return state.guestTokensByRoomId[roomId] ?? null
    }
    return null
  },
}
