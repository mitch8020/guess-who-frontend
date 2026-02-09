import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { matchesApi } from '@/api/matches'
import { queryClient } from '@/api/queryClient'

export const Route = createFileRoute('/rooms/$roomId/matches/$matchId/summary')({
  component: MatchSummaryPage,
})

function MatchSummaryPage() {
  const { roomId, matchId } = Route.useParams()
  const navigate = useNavigate()

  const matchQuery = useQuery({
    queryKey: ['match', roomId, matchId],
    queryFn: () => matchesApi.detail(roomId, matchId),
  })

  const rematchMutation = useMutation({
    mutationFn: () => matchesApi.rematch(roomId, matchId),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['match', roomId, result.match._id] })
      await navigate({
        to: '/rooms/$roomId/matches/$matchId',
        params: { roomId, matchId: result.match._id },
      })
    },
  })

  return (
    <div className="panel">
      <h1 className="page-title text-3xl">Match Summary</h1>
      <p className="subtle mt-2">
        Status: {matchQuery.data?.match.status} · Winner member: {matchQuery.data?.match.winnerMemberId ?? 'none'}
      </p>

      <div className="card-list">
        {matchQuery.data?.match.participants.map((participant) => (
          <article key={participant.roomMemberId} className="card">
            <h2 className="font-semibold">{participant.roomMemberId}</h2>
            <p className="subtle text-sm">Result: {participant.result}</p>
            <p className="subtle text-xs">
              Eliminated: {participant.eliminatedImageIds.length}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button className="btn btn-primary" type="button" onClick={() => rematchMutation.mutate()}>
          Start Rematch
        </button>
        <Link to="/rooms/$roomId/matches/$matchId/replay" params={{ roomId, matchId }} className="btn btn-secondary">
          Replay
        </Link>
        <Link to="/rooms/$roomId/history" params={{ roomId }} className="btn btn-secondary">
          History
        </Link>
        <Link to="/rooms/$roomId/lobby" params={{ roomId }} className="btn btn-secondary">
          Back to Lobby
        </Link>
      </div>
    </div>
  )
}
