import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { invitesApi } from '@/api/invites'
import { sessionStore } from '@/stores/sessionStore'
import { useSession } from '@/hooks/useSession'

export const Route = createFileRoute('/join/$code')({
  component: JoinInvitePage,
})

function JoinInvitePage() {
  const navigate = useNavigate()
  const { code } = Route.useParams()
  const session = useSession()
  const [displayName, setDisplayName] = useState(session.user?.displayName ?? '')
  const [error, setError] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)
  const normalizedCode = useMemo(() => code.toUpperCase(), [code])

  const inviteQuery = useQuery({
    queryKey: ['invite', normalizedCode],
    queryFn: () => invitesApi.resolve(normalizedCode),
  })

  const onJoin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setJoining(true)
    try {
      const result = await invitesApi.join(normalizedCode, {
        displayName,
        authToken: session.accessToken ?? undefined,
      })
      if (result.guestToken) {
        sessionStore.setGuestToken(result.room._id, result.guestToken)
      }
      await navigate({
        to: '/rooms/$roomId/lobby',
        params: { roomId: result.room._id },
      })
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to join invite.')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="panel">
      <h1 className="page-title text-3xl">Join Room Invite</h1>
      <p className="subtle mt-2">Invite code: {normalizedCode}</p>
      {inviteQuery.data ? (
        <div className="card mt-4">
          <h2 className="text-lg font-semibold">{inviteQuery.data.room.name}</h2>
          <p className="subtle text-sm">Type: {inviteQuery.data.room.type}</p>
        </div>
      ) : null}
      {inviteQuery.error ? (
        <p className="danger-text mt-4">
          {inviteQuery.error instanceof Error ? inviteQuery.error.message : 'Invite is invalid.'}
        </p>
      ) : null}
      <form className="field mt-4" onSubmit={onJoin}>
        <label className="field">
          Display name
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
            minLength={2}
            maxLength={40}
          />
        </label>
        {error ? <p className="danger-text">{error}</p> : null}
        <button className="btn btn-primary mt-2" disabled={joining || inviteQuery.isLoading} type="submit">
          {joining ? 'Joining...' : 'Join room'}
        </button>
      </form>
    </div>
  )
}
