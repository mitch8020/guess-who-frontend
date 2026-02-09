import type { User } from '@/types/domain'

export interface SessionState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  guestTokensByRoomId: Record<string, string>
}

const STORAGE_KEY = 'guess-who-session-v1'

const defaultState: SessionState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  guestTokensByRoomId: {},
}

const subscribers = new Set<() => void>()

const readInitialState = (): SessionState => {
  if (typeof window === 'undefined') {
    return defaultState
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return defaultState
    }
    const parsed = JSON.parse(raw) as SessionState
    return {
      ...defaultState,
      ...parsed,
      guestTokensByRoomId: parsed.guestTokensByRoomId ?? {},
    }
  } catch {
    return defaultState
  }
}

let state: SessionState = readInitialState()

const emit = () => {
  for (const subscriber of subscribers) {
    subscriber()
  }
}

const persist = () => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const sessionStore = {
  getState: () => state,
  subscribe: (callback: () => void) => {
    subscribers.add(callback)
    return () => subscribers.delete(callback)
  },
  setState: (nextState: SessionState) => {
    state = nextState
    persist()
    emit()
  },
  setSession: (payload: {
    accessToken: string
    refreshToken: string
    user: User
  }) => {
    state = {
      ...state,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      user: payload.user,
    }
    persist()
    emit()
  },
  clearUserSession: () => {
    state = {
      ...state,
      accessToken: null,
      refreshToken: null,
      user: null,
    }
    persist()
    emit()
  },
  setUser: (user: User | null) => {
    state = {
      ...state,
      user,
    }
    persist()
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
    persist()
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
