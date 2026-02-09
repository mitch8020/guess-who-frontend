import Rollbar from 'rollbar'

const clientToken = import.meta.env.VITE_ROLLBAR_CLIENT_TOKEN

export const rollbar = clientToken
  ? new Rollbar({
      accessToken: clientToken,
      captureUncaught: true,
      captureUnhandledRejections: true,
      enabled: true,
      environment: import.meta.env.VITE_ROLLBAR_ENV ?? 'development',
      codeVersion: import.meta.env.VITE_ROLLBAR_CODE_VERSION ?? 'dev',
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
  : null
