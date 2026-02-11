import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    include: ['src/routes/-app-wide-animations.e2e.test.tsx'],
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      reportsDirectory: 'coverage/layer-e2e',
      include: [
        'src/routes/__root.tsx',
        'src/routes/index.tsx',
      ],
      thresholds: {
        statements: 90,
      },
    },
  },
})
