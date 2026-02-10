import { defineConfig, loadEnv } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import viteReact from '@vitejs/plugin-react'

import tailwindcss from '@tailwindcss/vite'

import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const parsedPort = Number.parseInt(process.env.PORT ?? env.PORT ?? '1073', 10)
  const port = Number.isNaN(parsedPort) ? 1073 : parsedPort

  return {
    plugins: [
      ...(env.VITE_ENABLE_TANSTACK_DEVTOOLS === 'true' ? [devtools()] : []),
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      viteReact(),
      tailwindcss(),
    ],
    server: {
      host: '0.0.0.0',
      port,
      strictPort: true,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
