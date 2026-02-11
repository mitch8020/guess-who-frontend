import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    include: [
      'src/api/client.test.ts',
      'src/api/apis.test.ts',
      'src/api/queryClient.test.ts',
      'src/api/auth-url.test.ts',
      'src/stores/sessionStore.test.ts',
      'src/utils/motion.test.ts',
    ],
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      reportsDirectory: 'coverage/layer-unit',
      include: [
        'src/api/auth.ts',
        'src/api/chat.ts',
        'src/api/client.ts',
        'src/api/history.ts',
        'src/api/images.ts',
        'src/api/invites.ts',
        'src/api/matches.ts',
        'src/api/queryClient.ts',
        'src/api/rooms.ts',
        'src/stores/sessionStore.ts',
        'src/utils/motion.ts',
      ],
      thresholds: {
        statements: 90,
      },
    },
  },
})

