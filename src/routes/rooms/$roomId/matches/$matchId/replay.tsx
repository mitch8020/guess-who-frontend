import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { historyApi } from '@/api/history'
import { useRealtimeRoom } from '@/hooks/useRealtime'

export const Route = createFileRoute('/rooms/$roomId/matches/$matchId/replay')({
  component: MatchReplayPage,
})

function MatchReplayPage() {
  const { roomId, matchId } = Route.useParams()
  useRealtimeRoom(roomId, matchId)

  const replayQuery = useQuery({
    queryKey: ['replay', roomId, matchId],
    queryFn: () => historyApi.replay(roomId, matchId),
  })

  return (
    <div className="panel">
      <h1 className="page-title text-3xl">Match Replay</h1>
      <p className="subtle mt-2">Replay timeline for match {matchId}.</p>

      <div className="card-list mt-4">
        {replayQuery.data?.frames.map((frame) => (
          <article key={frame.actionId} className="card">
            <p className="font-semibold">{frame.actionType}</p>
            <p className="subtle text-xs">Actor: {frame.actorMemberId ?? 'system'}</p>
            <p className="subtle text-xs">{new Date(frame.createdAt).toLocaleString()}</p>
          </article>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <Link to="/rooms/$roomId/history" params={{ roomId }} className="btn btn-secondary">
          Back to History
        </Link>
        <Link
          to="/rooms/$roomId/matches/$matchId"
          params={{ roomId, matchId }}
          className="btn btn-primary"
        >
          Back to Match
        </Link>
      </div>
    </div>
  )
}
