import type { User } from '@/types/domain'
import { apiRequest } from '@/api/client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api'

export const authApi = {
  getGoogleStartUrl: () => {
    const redirectTo = `${window.location.origin}/auth/callback`
    return `${API_BASE_URL}/auth/google?redirectTo=${encodeURIComponent(redirectTo)}`
  },
  finalizeGoogleCallback: (params: URLSearchParams) =>
    apiRequest<{
      accessToken: string
      user: User
    }>(`/auth/google/callback?${params.toString()}`, { auth: 'none' }),
  refresh: () =>
    apiRequest<{
      accessToken: string
      user: User
    }>('/auth/refresh', {
      method: 'POST',
      auth: 'none',
    }),
  me: () =>
    apiRequest<{ user: User }>('/auth/me', {
      auth: 'user',
    }),
  logout: () =>
    apiRequest<void>('/auth/logout', {
      method: 'POST',
      auth: 'user',
    }),
}
