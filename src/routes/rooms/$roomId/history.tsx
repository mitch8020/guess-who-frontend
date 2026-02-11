import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { historyApi } from '@/api/history'
import { useRealtimeRoom } from '@/hooks/useRealtime'
import { getStaggerStyle, motionClassNames } from '@/utils/motion'

export const Route = createFileRoute('/rooms/$roomId/history')({
  component: RoomHistoryPage,
})

function RoomHistoryPage() {
  const { roomId } = Route.useParams()
  useRealtimeRoom(roomId)

  const historyQuery = useQuery({
    queryKey: ['history', roomId],
    queryFn: () => historyApi.list(roomId),
  })

  return (
    <div className={`panel ${motionClassNames.sectionEntry}`}>
      <h1 className={`page-title text-3xl ${motionClassNames.fadeIn}`}>Match History</h1>
      <p className={`subtle mt-2 ${motionClassNames.fadeIn}`} style={getStaggerStyle(1)}>
        Recent completed matches for this room.
      </p>

      <div className="card-list mt-4">
        {historyQuery.data?.items.map((item, index) => (
          <article
            key={item.matchId}
            className={`card ${motionClassNames.listItemEntry}`}
            style={getStaggerStyle(index, 35, 280)}
          >
            <p className="font-semibold">Match {item.matchId}</p>
            <p className="subtle text-sm">
              {item.status} · board {item.boardSize}x{item.boardSize}
            </p>
            <p className="subtle text-xs">Winner: {item.winnerMemberId ?? 'none'}</p>
            <div className={`mt-3 flex gap-2 ${motionClassNames.fadeIn}`} style={getStaggerStyle(index + 1, 20, 180)}>
              <Link
                to="/rooms/$roomId/matches/$matchId"
                params={{ roomId, matchId: item.matchId }}
                className="btn btn-secondary"
              >
                Open Match
              </Link>
              <Link
                to="/rooms/$roomId/matches/$matchId/replay"
                params={{ roomId, matchId: item.matchId }}
                className="btn btn-primary"
              >
                Replay
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
