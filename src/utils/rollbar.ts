import Rollbar from 'rollbar'

export const rollbar = new Rollbar({
  accessToken: import.meta.env.VITE_ROLLBAR_CLIENT_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
  enabled: Boolean(import.meta.env.VITE_ROLLBAR_CLIENT_TOKEN),
  environment: import.meta.env.VITE_ROLLBAR_ENV ?? 'development',
  payload: {
    client: {
      javascript: {
        source_map_enabled: true,
      },
    },
  },
  transform: (payload) => {
    const body = (payload as { body?: any }).body
    if (!body) {
      return
    }
    const scrub = (obj: Record<string, unknown>) => {
      for (const key of Object.keys(obj)) {
        if (/(token|secret|password|authorization|cookie|oauth)/i.test(key)) {
          obj[key] = '[REDACTED]'
        }
      }
    }

    if (body.trace?.extra) {
      scrub(body.trace.extra as Record<string, unknown>)
    }
    if (body.message?.body) {
      scrub(body.message.body as Record<string, unknown>)
    }
  },
})
