// @vitest-environment jsdom

import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useRealtimeRoom } from '@/hooks/useRealtime'
import { sessionStore } from '@/stores/sessionStore'

const ioMock = vi.fn()
const invalidateQueriesMock = vi.fn(() => Promise.resolve())

vi.mock('socket.io-client', () => ({
  io: (...args: unknown[]) => ioMock(...args),
}))

vi.mock('@/api/queryClient', () => ({
  queryClient: {
    invalidateQueries: (...args: unknown[]) => invalidateQueriesMock(...args),
  },
}))

const HookHarness = ({ roomId, matchId }: { roomId: string; matchId?: string }) => {
  useRealtimeRoom(roomId, matchId)
  return null
}

describe('useRealtimeRoom', () => {
  beforeEach(() => {
    ioMock.mockReset()
    invalidateQueriesMock.mockReset()
    sessionStore.setState({
      accessToken: null,
      user: null,
      guestTokensByRoomId: {},
    })
  })

  afterEach(() => {
    sessionStore.setState({
      accessToken: null,
      user: null,
      guestTokensByRoomId: {},
    })
  })

  it('does not connect when no player token exists', () => {
    render(<HookHarness roomId="room-1" />)
    expect(ioMock).not.toHaveBeenCalled()
  })

  it('connects, subscribes, refreshes cache, and disconnects on cleanup', () => {
    sessionStore.setState({
      accessToken: null,
      user: null,
      guestTokensByRoomId: { 'room-1': 'guest-token' },
    })
    const listeners: Record<string, () => void> = {}
    const socket = {
      emit: vi.fn(),
      on: vi.fn((event: string, handler: () => void) => {
        listeners[event] = handler
      }),
      disconnect: vi.fn(),
    }
    ioMock.mockReturnValue(socket)

    const { unmount } = render(<HookHarness roomId="room-1" matchId="match-1" />)

    expect(ioMock).toHaveBeenCalledWith('ws://localhost:3001/ws', {
      transports: ['websocket'],
      auth: { token: 'guest-token' },
    })
    expect(socket.emit).toHaveBeenCalledWith('room.join', { roomId: 'room-1' })
    expect(socket.emit).toHaveBeenCalledWith('match.join', {
      roomId: 'room-1',
      matchId: 'match-1',
    })

    listeners['presence.updated']?.()
    listeners['action.applied']?.()

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ['room', 'room-1'],
    })
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ['images', 'room-1'],
    })
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ['history', 'room-1'],
    })
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ['chat', 'room-1'],
    })
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ['match', 'room-1', 'match-1'],
    })
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ['replay', 'room-1', 'match-1'],
    })

    unmount()
    expect(socket.disconnect).toHaveBeenCalledTimes(1)
  })
})

