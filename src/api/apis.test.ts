import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authApi } from '@/api/auth'
import { chatApi } from '@/api/chat'
import { imagesApi } from '@/api/images'
import { invitesApi } from '@/api/invites'
import { matchesApi } from '@/api/matches'
import { roomsApi } from '@/api/rooms'
import { historyApi } from '@/api/history'

const apiRequestMock = vi.fn()

vi.mock('@/api/client', () => ({
  apiRequest: (...args: unknown[]) => apiRequestMock(...args),
}))

describe('api wrappers', () => {
  beforeEach(() => {
    apiRequestMock.mockReset()
  })

  it('builds auth requests with expected paths and auth modes', () => {
    authApi.finalizeGoogleCallback(new URLSearchParams('code=abc'))
    authApi.refresh()
    authApi.me()
    authApi.logout()

    expect(apiRequestMock).toHaveBeenNthCalledWith(1, '/auth/google/callback?code=abc', {
      auth: 'none',
    })
    expect(apiRequestMock).toHaveBeenNthCalledWith(2, '/auth/refresh', {
      method: 'POST',
      auth: 'none',
    })
    expect(apiRequestMock).toHaveBeenNthCalledWith(3, '/auth/me', {
      auth: 'user',
    })
    expect(apiRequestMock).toHaveBeenNthCalledWith(4, '/auth/logout', {
      method: 'POST',
      auth: 'user',
    })
  })

  it('builds room and invite requests', () => {
    roomsApi.list()
    roomsApi.create({ name: 'Room', type: 'temporary' })
    roomsApi.detail('room-1')
    roomsApi.update('room-1', { name: 'Updated' })
    roomsApi.archive('room-1')
    roomsApi.removeMember('room-1', 'member-1')
    roomsApi.muteMember('room-1', 'member-1', 10)
    roomsApi.unmuteMember('room-1', 'member-1')

    invitesApi.create('room-1', { allowGuestJoin: true })
    invitesApi.resolve('ABCD1234')
    invitesApi.join('ABCD1234', { displayName: 'Guest' }, false)
    invitesApi.join('ABCD1234', { displayName: 'User' }, true)
    invitesApi.revoke('room-1', 'invite-1')

    expect(apiRequestMock).toHaveBeenCalledWith('/rooms', { auth: 'user' })
    expect(apiRequestMock).toHaveBeenCalledWith('/rooms/room-1', {
      auth: 'player',
      roomId: 'room-1',
    })
    expect(apiRequestMock).toHaveBeenCalledWith('/invites/ABCD1234', { auth: 'none' })
    expect(apiRequestMock).toHaveBeenCalledWith('/invites/ABCD1234/join', {
      method: 'POST',
      body: JSON.stringify({ displayName: 'Guest' }),
      auth: 'none',
    })
    expect(apiRequestMock).toHaveBeenCalledWith('/invites/ABCD1234/join', {
      method: 'POST',
      body: JSON.stringify({ displayName: 'User' }),
      auth: 'user',
    })
  })

  it('builds image, match, and chat requests including cursor encodes', async () => {
    await imagesApi.upload('room-1', new File(['x'], 'cat.jpg', { type: 'image/jpeg' }))
    imagesApi.list('room-1')
    imagesApi.remove('room-1', 'image-1')
    imagesApi.bulkRemove('room-1', ['image-1', 'image-2'])

    matchesApi.start('room-1', { boardSize: 4, opponentMemberId: 'member-2' })
    matchesApi.detail('room-1', 'match-1')
    matchesApi.history('room-1', 'cursor value', 7)
    matchesApi.replay('room-1', 'match-1')
    matchesApi.action('room-1', 'match-1', { actionType: 'ask' })
    matchesApi.forfeit('room-1', 'match-1')
    matchesApi.rematch('room-1', 'match-1', 6)
    historyApi.list('room-1', undefined, 5)
    historyApi.replay('room-1', 'match-1')

    chatApi.list('room-1', 'cursor value', 12)
    chatApi.send('room-1', 'hello')

    expect(apiRequestMock).toHaveBeenCalledWith('/rooms/room-1/images', {
      method: 'POST',
      body: expect.any(FormData),
      auth: 'player',
      roomId: 'room-1',
    })
    expect(apiRequestMock).toHaveBeenCalledWith(
      '/rooms/room-1/matches/history?limit=7&cursor=cursor%20value',
      {
        auth: 'player',
        roomId: 'room-1',
      },
    )
    expect(apiRequestMock).toHaveBeenCalledWith(
      '/rooms/room-1/chat/messages?limit=12&cursor=cursor%20value',
      {
        auth: 'player',
        roomId: 'room-1',
      },
    )
    expect(apiRequestMock).toHaveBeenCalledWith('/rooms/room-1/matches/history?limit=5', {
      auth: 'player',
      roomId: 'room-1',
    })
    expect(apiRequestMock).toHaveBeenCalledWith('/rooms/room-1/matches/match-1/replay', {
      auth: 'player',
      roomId: 'room-1',
    })
  })
})
