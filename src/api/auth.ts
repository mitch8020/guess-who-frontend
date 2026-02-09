import { apiRequest } from '@/api/client'
import type { User } from '@/types/domain'

export const authApi = {
  getGoogleStartUrl: () => {
    const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api'
    const redirectTo = `${window.location.origin}/auth/callback`
    return `${base}/auth/google?redirectTo=${encodeURIComponent(redirectTo)}`
  },
  finalizeGoogleCallback: (params: URLSearchParams) =>
    apiRequest<{
      accessToken: string
      refreshToken: string
      user: User
    }>(`/auth/google/callback?${params.toString()}`, { auth: 'none' }),
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
