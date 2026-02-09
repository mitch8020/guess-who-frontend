import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { roomsApi } from '@/api/rooms'
import { useSession } from '@/hooks/useSession'

export const Route = createFileRoute('/rooms/')({
  component: RoomsPage,
})

function RoomsPage() {
  const navigate = useNavigate()
  const session = useSession()

  const roomsQuery = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomsApi.list(),
    enabled: Boolean(session.user),
  })

  if (!session.user) {
    return (
      <div className="panel">
        <h1 className="page-title text-3xl">Sign in required</h1>
        <p className="subtle mt-3">You must sign in to view your room list.</p>
      </div>
    )
  }

  return (
    <div className="panel">
      <h1 className="page-title text-3xl">Your Rooms</h1>
      <p className="subtle mt-2">Default room cap is 8 players, configurable up to 20.</p>

      <div className="mt-4 flex gap-2">
        <Link to="/rooms/new" className="btn btn-primary">
          Create Room
        </Link>
      </div>

      {roomsQuery.isLoading ? <p className="subtle mt-4">Loading rooms...</p> : null}
      {roomsQuery.error ? (
        <p className="danger-text mt-4">{roomsQuery.error instanceof Error ? roomsQuery.error.message : 'Failed to load rooms.'}</p>
      ) : null}

      <div className="card-list">
        {roomsQuery.data?.rooms.map((room) => (
          <article key={room._id} className="card">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{room.name}</h2>
                <p className="subtle text-sm">
                  {room.type} room · max {room.settings.maxPlayers} players
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  void navigate({
                    to: '/rooms/$roomId/lobby',
                    params: { roomId: room._id },
                  })
                }
              >
                Open Lobby
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
