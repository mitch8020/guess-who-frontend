import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    include: ['src/components/Header.test.tsx', 'src/components/PageTransition.test.tsx'],
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      reportsDirectory: 'coverage/layer-component',
      include: ['src/components/Header.tsx', 'src/components/PageTransition.tsx'],
      thresholds: {
        statements: 90,
      },
    },
  },
})

