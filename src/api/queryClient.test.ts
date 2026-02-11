import { describe, expect, it } from 'vitest'
import { queryClient } from '@/api/queryClient'

describe('queryClient defaults', () => {
  it('disables focus refetch and retries once', () => {
    const defaults = queryClient.getDefaultOptions()
    expect(defaults.queries?.refetchOnWindowFocus).toBe(false)
    expect(defaults.queries?.retry).toBe(1)
  })
})

