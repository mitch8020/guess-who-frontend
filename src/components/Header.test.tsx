// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Header from '@/components/Header'
import { sessionStore } from '@/stores/sessionStore'

const meMock = vi.fn()
const refreshMock = vi.fn()
const logoutMock = vi.fn()

vi.mock('@/api/auth', () => ({
  authApi: {
    me: (...args: unknown[]) => meMock(...args),
    refresh: (...args: unknown[]) => refreshMock(...args),
    logout: (...args: unknown[]) => logoutMock(...args),
    getGoogleStartUrl: () => 'https://accounts.google.com/o/oauth2/v2/auth',
  },
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...rest }: any) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}))

describe('Header', () => {
  beforeEach(() => {
    meMock.mockReset()
    refreshMock.mockReset()
    logoutMock.mockReset()
    refreshMock.mockResolvedValue({
      accessToken: 'fallback-token',
      user: {
        _id: 'fallback-user',
        displayName: 'Fallback',
        email: 'fallback@example.com',
        status: 'active',
      },
    })
    sessionStore.setState({
      accessToken: null,
      user: null,
      guestTokensByRoomId: {},
    })
  })

  afterEach(() => {
    cleanup()
    sessionStore.setState({
      accessToken: null,
      user: null,
      guestTokensByRoomId: {},
    })
  })

  it('attempts refresh when no user is loaded', async () => {
    refreshMock.mockResolvedValue({
      accessToken: 'fresh-token',
      user: {
        _id: 'user-1',
        displayName: 'Test User',
        email: 'u@example.com',
        status: 'active',
      },
    })

    render(<Header />)

    await waitFor(() => expect(refreshMock).toHaveBeenCalledTimes(1))
    expect(sessionStore.getState().accessToken).toBe('fresh-token')
  })

  it('attempts /me recovery when access token exists without user', async () => {
    sessionStore.setState({
      accessToken: 'access-token',
      user: null,
      guestTokensByRoomId: {},
    })
    meMock.mockResolvedValue({
      user: {
        _id: 'user-2',
        displayName: 'Recovered User',
        email: 'r@example.com',
        status: 'active',
      },
    })

    render(<Header />)

    await waitFor(() => expect(meMock).toHaveBeenCalledTimes(1))
    await waitFor(() =>
      expect(sessionStore.getState().user).toMatchObject({
        displayName: 'Recovered User',
      }),
    )
  })

  it('shows authenticated links and logs out', async () => {
    sessionStore.setState({
      accessToken: 'access-token',
      user: {
        _id: 'user-3',
        displayName: 'Signed In User',
        email: 's@example.com',
        status: 'active',
      } as any,
      guestTokensByRoomId: {},
    })
    logoutMock.mockResolvedValue(undefined)
    refreshMock.mockRejectedValueOnce(new Error('no refresh after logout'))

    render(<Header />)

    expect(screen.getByRole('link', { name: /rooms/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /new room/i })).toBeTruthy()
    const logoutButton = screen.getByRole('button', { name: /logout/i })
    fireEvent.click(logoutButton)

    await waitFor(() => expect(logoutMock).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(sessionStore.getState().accessToken).toBeNull())
  })
})
