// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import { authApi } from '@/api/auth'

describe('authApi.getGoogleStartUrl', () => {
  it('encodes callback redirect to frontend origin', () => {
    const url = authApi.getGoogleStartUrl()
    expect(url).toContain('/auth/google?redirectTo=')
    expect(decodeURIComponent(url.split('redirectTo=')[1])).toBe(
      `${window.location.origin}/auth/callback`,
    )
  })
})

