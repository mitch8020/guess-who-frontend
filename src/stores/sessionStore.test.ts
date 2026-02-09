import { describe, expect, it } from 'vitest'
import { sessionStore } from '@/stores/sessionStore'

describe('sessionStore', () => {
  it('prioritizes user token over guest token', () => {
    sessionStore.setState({
      accessToken: 'user-token',
      refreshToken: 'refresh-token',
      user: null,
      guestTokensByRoomId: { room1: 'guest-token' },
    })

    expect(sessionStore.getPlayerToken('room1')).toBe('user-token')
  })

  it('returns room guest token when user session is absent', () => {
    sessionStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      guestTokensByRoomId: { room2: 'guest-room-token' },
    })

    expect(sessionStore.getPlayerToken('room2')).toBe('guest-room-token')
  })
})
