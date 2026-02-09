import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { invitesApi } from '@/api/invites'
import { matchesApi } from '@/api/matches'
import { roomsApi } from '@/api/rooms'
import { queryClient } from '@/api/queryClient'
import { useRealtimeRoom } from '@/hooks/useRealtime'

export const Route = createFileRoute('/rooms/$roomId/lobby')({
  component: RoomLobbyPage,
})

function RoomLobbyPage() {
  const { roomId } = Route.useParams()
  const navigate = useNavigate()
  useRealtimeRoom(roomId)

  const roomQuery = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => roomsApi.detail(roomId),
  })

  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [opponentMemberId, setOpponentMemberId] = useState('')
  const [boardSize, setBoardSize] = useState(4)
  const [defaultBoardSize, setDefaultBoardSize] = useState(4)
  const [error, setError] = useState<string | null>(null)

  const inviteMutation = useMutation({
    mutationFn: () => invitesApi.create(roomId),
    onSuccess: (result) => {
      setInviteCode(result.invite.code)
    },
  })

  const updatePresetMutation = useMutation({
    mutationFn: () =>
      roomsApi.update(roomId, {
        settings: {
          defaultBoardSize,
          rematchBoardSizes: [defaultBoardSize],
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['room', roomId] })
    },
  })

  const muteMutation = useMutation({
    mutationFn: ({ memberId, mute }: { memberId: string; mute: boolean }) =>
      mute ? roomsApi.muteMember(roomId, memberId, 30) : roomsApi.unmuteMember(roomId, memberId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['room', roomId] })
    },
  })

  const startMutation = useMutation({
    mutationFn: () => matchesApi.start(roomId, { boardSize, opponentMemberId }),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['room', roomId] })
      await navigate({
        to: '/rooms/$roomId/matches/$matchId',
        params: {
          roomId,
          matchId: result.match._id,
        },
      })
    },
  })

  const activeMembers = roomQuery.data?.members ?? []
  const currentMember = roomQuery.data?.member
  const isHost = currentMember?.role === 'host'

  const opponentOptions = useMemo(
    () =>
      activeMembers.filter((member) => member._id !== currentMember?._id && member.status === 'active'),
    [activeMembers, currentMember?._id],
  )

  const onStartMatch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    if (!opponentMemberId) {
      setError('Select an opponent member first.')
      return
    }
    startMutation.mutate()
  }

  return (
    <div className="panel">
      <h1 className="page-title text-3xl">{roomQuery.data?.room.name ?? 'Room Lobby'}</h1>
      <p className="subtle mt-2">
        {roomQuery.data?.room.type ?? 'temporary'} room · {activeMembers.length} active players
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/rooms/$roomId/images" params={{ roomId }} className="btn btn-secondary">
          Manage Images
        </Link>
        <button className="btn btn-secondary" onClick={() => inviteMutation.mutate()} type="button">
          Generate Invite
        </button>
        <Link to="/rooms/$roomId/history" params={{ roomId }} className="btn btn-secondary">
          Match History
        </Link>
      </div>

      {inviteCode ? (
        <p className="mt-3">
          Invite code: <strong>{inviteCode}</strong> · link:{' '}
          <Link to="/join/$code" params={{ code: inviteCode }} className="underline">
            /join/{inviteCode}
          </Link>
        </p>
      ) : null}

      <section className="card mt-5">
        <h2 className="text-lg font-semibold">Players</h2>
        <div className="card-list">
          {activeMembers.map((member) => (
            <div key={member._id} className="card flex items-center justify-between">
              <div>
                <p>
                  {member.displayName} <span className="subtle">({member.role})</span>
                </p>
                {member.mutedUntil ? <p className="danger-text text-xs">Muted until {new Date(member.mutedUntil).toLocaleTimeString()}</p> : null}
              </div>
              {isHost && member.role !== 'host' ? (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => muteMutation.mutate({ memberId: member._id, mute: !member.mutedUntil })}
                >
                  {member.mutedUntil ? 'Unmute' : 'Mute'}
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {isHost ? (
        <section className="card mt-5">
          <h2 className="text-lg font-semibold">Rematch Presets</h2>
          <div className="grid-two mt-3">
            <label className="field">
              Default board size
              <select
                value={defaultBoardSize}
                onChange={(event) => setDefaultBoardSize(Number(event.target.value))}
              >
                {(roomQuery.data?.room.settings.allowedBoardSizes ?? [4, 5, 6]).map((size) => (
                  <option value={size} key={size}>
                    {size} x {size}
                  </option>
                ))}
              </select>
            </label>
            <div className="field justify-end">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => updatePresetMutation.mutate()}
              >
                Save Preset
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="card mt-5">
        <h2 className="text-lg font-semibold">Start 1v1 Match</h2>
        <p className="subtle mt-1">Host starts a match with one opponent while room spectators can observe.</p>
        <form className="mt-3" onSubmit={onStartMatch}>
          <div className="grid-two">
            <label className="field">
              Opponent
              <select value={opponentMemberId} onChange={(event) => setOpponentMemberId(event.target.value)}>
                <option value="">Select member</option>
                {opponentOptions.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.displayName}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Board size
              <select value={boardSize} onChange={(event) => setBoardSize(Number(event.target.value))}>
                {(roomQuery.data?.room.settings.allowedBoardSizes ?? [4, 5, 6]).map((size) => (
                  <option value={size} key={size}>
                    {size} x {size}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {error ? <p className="danger-text mt-2">{error}</p> : null}
          {startMutation.error ? (
            <p className="danger-text mt-2">
              {startMutation.error instanceof Error ? startMutation.error.message : 'Failed to start match.'}
            </p>
          ) : null}
          <button type="submit" className="btn btn-primary mt-3" disabled={startMutation.isPending || !isHost}>
            {startMutation.isPending ? 'Starting...' : 'Start Match'}
          </button>
        </form>
      </section>
    </div>
  )
}
