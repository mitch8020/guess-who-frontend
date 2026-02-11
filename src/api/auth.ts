import type { User } from '@/types/domain'
import { apiRequest } from '@/api/client'

export const authApi = {
  getGoogleStartUrl: () => {
    const base = import.meta.env.VITE_API_BASE_URL
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
