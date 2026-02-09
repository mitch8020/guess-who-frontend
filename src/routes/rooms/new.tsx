import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { roomsApi } from '@/api/rooms'
import { useSession } from '@/hooks/useSession'
import { queryClient } from '@/api/queryClient'

export const Route = createFileRoute('/rooms/new')({
  component: CreateRoomPage,
})

function CreateRoomPage() {
  const navigate = useNavigate()
  const session = useSession()
  const [name, setName] = useState('')
  const [type, setType] = useState<'temporary' | 'permanent'>('temporary')
  const [maxPlayers, setMaxPlayers] = useState<number>(8)
  const [allowGuestJoin, setAllowGuestJoin] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  if (!session.user) {
    return (
      <div className="panel">
        <h1 className="page-title text-3xl">Sign in required</h1>
        <p className="subtle mt-3">Create room requires an authenticated host account.</p>
      </div>
    )
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const created = await roomsApi.create({
        name,
        type,
        settings: {
          maxPlayers,
          allowGuestJoin,
          allowedBoardSizes: [4, 5, 6],
        },
      })
      await queryClient.invalidateQueries({ queryKey: ['rooms'] })
      await navigate({
        to: '/rooms/$roomId/lobby',
        params: { roomId: created.room._id },
      })
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to create room.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="panel">
      <h1 className="page-title text-3xl">Create Room</h1>
      <form className="mt-4" onSubmit={onSubmit}>
        <label className="field">
          Room name
          <input value={name} onChange={(event) => setName(event.target.value)} required minLength={3} maxLength={80} />
        </label>
        <div className="grid-two">
          <label className="field">
            Room type
            <select value={type} onChange={(event) => setType(event.target.value as 'temporary' | 'permanent')}>
              <option value="temporary">Temporary</option>
              <option value="permanent">Permanent</option>
            </select>
          </label>
          <label className="field">
            Max players (2-20)
            <input
              type="number"
              value={maxPlayers}
              min={2}
              max={20}
              onChange={(event) => setMaxPlayers(Number(event.target.value))}
            />
          </label>
        </div>
        <label className="field">
          <span>Allow guest join</span>
          <input
            type="checkbox"
            checked={allowGuestJoin}
            onChange={(event) => setAllowGuestJoin(event.target.checked)}
          />
        </label>
        {error ? <p className="danger-text mt-3">{error}</p> : null}
        <button className="btn btn-primary mt-4" disabled={saving} type="submit">
          {saving ? 'Creating...' : 'Create room'}
        </button>
      </form>
    </div>
  )
}
