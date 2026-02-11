import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiClientError, apiRequest } from '@/api/client'
import { sessionStore } from '@/stores/sessionStore'

const rollbarErrorMock = vi.fn()

vi.mock('@/utils/rollbar', () => ({
  rollbar: { error: (...args: unknown[]) => rollbarErrorMock(...args) },
}))

describe('apiRequest', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    rollbarErrorMock.mockReset()
    sessionStore.setState({
      accessToken: null,
      user: null,
      guestTokensByRoomId: {},
    })
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('applies user auth and json content-type automatically', async () => {
    sessionStore.setState({
      accessToken: 'user-token',
      user: null,
      guestTokensByRoomId: {},
    })
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('{"ok":true}'),
    })
    global.fetch = fetchMock as typeof fetch

    const result = await apiRequest<{ ok: boolean }>('/rooms', {
      method: 'POST',
      body: JSON.stringify({ name: 'Room' }),
    })

    expect(result).toEqual({ ok: true })
    const requestInit = fetchMock.mock.calls[0][1]
    expect((requestInit as RequestInit).credentials).toBe('include')
    const headers = (requestInit as RequestInit).headers as Headers
    expect(headers.get('authorization')).toBe('Bearer user-token')
    expect(headers.get('content-type')).toBe('application/json')
  })

  it('uses player token auth for room-scoped requests', async () => {
    sessionStore.setState({
      accessToken: null,
      user: null,
      guestTokensByRoomId: { 'room-1': 'guest-token' },
    })
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('{"items":[]}'),
    }) as typeof fetch

    await apiRequest('/rooms/room-1/images', {
      auth: 'player',
      roomId: 'room-1',
    })

    const headers = ((global.fetch as any).mock.calls[0][1].headers as Headers)
    expect(headers.get('authorization')).toBe('Bearer guest-token')
  })

  it('does not force json header for FormData', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('{"ok":true}'),
    }) as typeof fetch

    await apiRequest('/rooms/room-1/images', {
      method: 'POST',
      auth: 'none',
      body: new FormData(),
    })

    const headers = ((global.fetch as any).mock.calls[0][1].headers as Headers)
    expect(headers.get('content-type')).toBeNull()
  })

  it('refreshes and retries once on 401 user requests', async () => {
    sessionStore.setState({
      accessToken: 'expired-access',
      user: null,
      guestTokensByRoomId: {},
    })
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              accessToken: 'fresh-access',
              user: { _id: 'user-1' },
            }),
          ),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve('{"ok":true}'),
      }) as typeof fetch

    const result = await apiRequest<{ ok: boolean }>('/rooms', { auth: 'user' })
    expect(result).toEqual({ ok: true })
    expect((global.fetch as any).mock.calls).toHaveLength(3)
    expect(sessionStore.getState().accessToken).toBe('fresh-access')
  })

  it('clears user session when refresh fails after 401', async () => {
    sessionStore.setState({
      accessToken: 'expired-access',
      user: { _id: 'user-1' } as any,
      guestTokensByRoomId: {},
    })
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve(''),
      }) as typeof fetch

    await expect(apiRequest('/rooms', { auth: 'user' })).rejects.toBeInstanceOf(
      ApiClientError,
    )
    expect(sessionStore.getState().accessToken).toBeNull()
    expect(sessionStore.getState().user).toBeNull()
  })

  it('throws ApiClientError with payload metadata and reports to rollbar', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            error: {
              code: 'ROOM_NOT_FOUND',
              message: 'Room missing',
              details: { roomId: 'room-1' },
            },
          }),
        ),
    }) as typeof fetch

    await expect(apiRequest('/rooms/room-1', { auth: 'none' })).rejects.toMatchObject({
      status: 404,
      code: 'ROOM_NOT_FOUND',
      message: 'Room missing',
      details: { roomId: 'room-1' },
    })
    expect(rollbarErrorMock).toHaveBeenCalledWith(
      expect.any(ApiClientError),
      expect.objectContaining({
        path: '/rooms/room-1',
        status: 404,
        code: 'ROOM_NOT_FOUND',
      }),
    )
  })

  it('supports empty and 204 responses', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(''),
      }) as typeof fetch

    await expect(apiRequest('/logout', { auth: 'none' })).resolves.toBeUndefined()
    await expect(apiRequest('/empty', { auth: 'none' })).resolves.toBeUndefined()
  })
})

