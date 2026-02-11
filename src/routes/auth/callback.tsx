import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { authApi } from '@/api/auth'
import { sessionStore } from '@/stores/sessionStore'
import { motionClassNames } from '@/utils/motion'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackPage,
})

function AuthCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const completeAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
        }
        const hasProviderCallbackParams =
          params.has('code') || params.has('state') || params.has('error')
        const session = hasProviderCallbackParams
          ? await authApi.finalizeGoogleCallback(params)
          : await authApi.refresh()
        sessionStore.setSession(session)
        await navigate({ to: '/rooms' })
      } catch (caughtError) {
        sessionStore.clearUserSession()
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : 'Authentication callback failed.'
        setError(message)
      }
    }
    void completeAuth()
  }, [navigate])

  return (
    <div className={`panel ${motionClassNames.sectionEntry}`}>
      <h1 className={`page-title text-3xl ${motionClassNames.fadeIn}`}>Completing sign-in...</h1>
      {error ? <p className="danger-text mt-4">{error}</p> : <p className="subtle mt-4">Please wait.</p>}
    </div>
  )
}
