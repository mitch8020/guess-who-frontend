import { describe, expect, it, vi } from 'vitest'
import { sessionStore } from '@/stores/sessionStore'

describe('sessionStore', () => {
  it('prioritizes user token over guest token', () => {
    sessionStore.setState({
      accessToken: 'user-token',
      user: null,
      guestTokensByRoomId: { room1: 'guest-token' },
    })

    expect(sessionStore.getPlayerToken('room1')).toBe('user-token')
  })

  it('returns room guest token when user session is absent', () => {
    sessionStore.setState({
      accessToken: null,
      user: null,
      guestTokensByRoomId: { room2: 'guest-room-token' },
    })

    expect(sessionStore.getPlayerToken('room2')).toBe('guest-room-token')
  })

  it('notifies subscribers for state changes and allows unsubscribe', () => {
    const callback = vi.fn()
    const unsubscribe = sessionStore.subscribe(callback)

    sessionStore.setSession({
      accessToken: 'access',
      user: { _id: 'user-1', displayName: 'User', email: 'u@example.com', status: 'active' } as any,
    })
    expect(callback).toHaveBeenCalledTimes(1)

    sessionStore.clearUserSession()
    expect(sessionStore.getState().accessToken).toBeNull()
    expect(callback).toHaveBeenCalledTimes(2)

    unsubscribe()
    sessionStore.setUser({ _id: 'user-2', displayName: 'Second', email: 's@example.com', status: 'active' } as any)
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('stores guest tokens by room and returns null without room id', () => {
    sessionStore.setState({
      accessToken: null,
      user: null,
      guestTokensByRoomId: {},
    })
    sessionStore.setGuestToken('room-5', 'guest-token-5')

    expect(sessionStore.getState().guestTokensByRoomId.room5).toBeUndefined()
    expect(sessionStore.getState().guestTokensByRoomId['room-5']).toBe('guest-token-5')
    expect(sessionStore.getPlayerToken()).toBeNull()
  })
})
