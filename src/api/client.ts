import { sessionStore } from '@/stores/sessionStore'
import type { ApiError } from '@/types/api'
import type { User } from '@/types/domain'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api'

export class ApiClientError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: Record<string, unknown>

  constructor(status: number, code: string, message: string, details?: Record<string, unknown>) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

interface RequestOptions extends RequestInit {
  auth?: 'none' | 'user' | 'player'
  roomId?: string
}

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return undefined as T
  }
  const text = await response.text()
  if (!text) {
    return undefined as T
  }
  return JSON.parse(text) as T
}

const buildAuthorizationHeader = (auth: RequestOptions['auth'], roomId?: string): string | null => {
  if (auth === 'none') {
    return null
  }
  if (auth === 'user') {
    return sessionStore.getState().accessToken
      ? `Bearer ${sessionStore.getState().accessToken}`
      : null
  }
  const playerToken = sessionStore.getPlayerToken(roomId)
  return playerToken ? `Bearer ${playerToken}` : null
}

const refreshSession = async (): Promise<boolean> => {
  const refreshToken = sessionStore.getState().refreshToken
  if (!refreshToken) {
    return false
  }
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${refreshToken}`,
    },
    body: JSON.stringify({ refreshToken }),
    credentials: 'include',
  })
  if (!response.ok) {
    sessionStore.clearUserSession()
    return false
  }
  const payload = await parseResponse<{
    accessToken: string
    refreshToken: string
    user: User
  }>(response)
  sessionStore.setSession(payload)
  return true
}

export const apiRequest = async <T>(path: string, options?: RequestOptions): Promise<T> => {
  const auth = options?.auth ?? 'user'
  const headers = new Headers(options?.headers ?? {})
  if (!headers.has('content-type') && options?.body && !(options.body instanceof FormData)) {
    headers.set('content-type', 'application/json')
  }

  const authorizationHeader = buildAuthorizationHeader(auth, options?.roomId)
  if (authorizationHeader) {
    headers.set('authorization', authorizationHeader)
  }

  const send = async (): Promise<Response> =>
    fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    })

  let response = await send()
  if (response.status === 401 && auth === 'user') {
    const refreshed = await refreshSession()
    if (refreshed) {
      const retriedAuthHeader = buildAuthorizationHeader(auth, options?.roomId)
      if (retriedAuthHeader) {
        headers.set('authorization', retriedAuthHeader)
      }
      response = await send()
    }
  }

  if (!response.ok) {
    const errorPayload = await parseResponse<ApiError>(response).catch(() => undefined)
    throw new ApiClientError(
      response.status,
      errorPayload?.error.code ?? 'REQUEST_FAILED',
      errorPayload?.error.message ?? `Request failed with status ${response.status}`,
      errorPayload?.error.details,
    )
  }

  return parseResponse<T>(response)
}
