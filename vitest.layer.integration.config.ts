import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    include: ['src/hooks/useRealtime.test.tsx'],
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      reportsDirectory: 'coverage/layer-integration',
      include: ['src/hooks/useRealtime.ts'],
      thresholds: {
        statements: 90,
      },
    },
  },
})

