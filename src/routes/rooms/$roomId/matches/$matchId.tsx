import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { FormEvent } from 'react'
import { chatApi } from '@/api/chat'
import { matchesApi } from '@/api/matches'
import { queryClient } from '@/api/queryClient'
import { useRealtimeRoom } from '@/hooks/useRealtime'
import { getStaggerStyle, motionClassNames } from '@/utils/motion'

export const Route = createFileRoute('/rooms/$roomId/matches/$matchId')({
  component: MatchBoardPage,
})

function MatchBoardPage() {
  const { roomId, matchId } = Route.useParams()
  const navigate = useNavigate()
  const [imageIdInput, setImageIdInput] = useState('')
  const [chatMessage, setChatMessage] = useState('')
  useRealtimeRoom(roomId, matchId)

  const matchQuery = useQuery({
    queryKey: ['match', roomId, matchId],
    queryFn: () => matchesApi.detail(roomId, matchId),
  })

  const chatQuery = useQuery({
    queryKey: ['chat', roomId],
    queryFn: () => chatApi.list(roomId),
  })

  const sendChatMutation = useMutation({
    mutationFn: () => chatApi.send(roomId, chatMessage),
    onSuccess: async () => {
      setChatMessage('')
      await queryClient.invalidateQueries({ queryKey: ['chat', roomId] })
    },
  })

  const actionMutation = useMutation({
    mutationFn: (payload: { actionType: 'ask' | 'answer' | 'eliminate' | 'guess'; payload?: Record<string, unknown> }) =>
      matchesApi.action(roomId, matchId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['match', roomId, matchId] })
    },
  })

  const forfeitMutation = useMutation({
    mutationFn: () => matchesApi.forfeit(roomId, matchId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['match', roomId, matchId] })
    },
  })

  const boardImages = useMemo(
    () =>
      matchQuery.data?.participantState?.boardImageOrder ??
      matchQuery.data?.match.selectedImageIds ??
      [],
    [matchQuery.data?.match.selectedImageIds, matchQuery.data?.participantState?.boardImageOrder],
  )

  const onImageAction = (event: FormEvent<HTMLFormElement>, actionType: 'eliminate' | 'guess') => {
    event.preventDefault()
    if (!imageIdInput.trim()) {
      return
    }
    actionMutation.mutate({ actionType, payload: { imageId: imageIdInput.trim() } })
    setImageIdInput('')
  }

  const onSendChat = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!chatMessage.trim()) {
      return
    }
    sendChatMutation.mutate()
  }

  const submitGuess = () => {
    if (!imageIdInput.trim()) {
      return
    }
    actionMutation.mutate({ actionType: 'guess', payload: { imageId: imageIdInput.trim() } })
    setImageIdInput('')
  }

  const match = matchQuery.data?.match
  const isCompleted = match?.status === 'completed'

  return (
    <div className={`panel ${motionClassNames.sectionEntry}`}>
      <h1 className={`page-title text-3xl ${motionClassNames.fadeIn}`}>Match Board</h1>
      <p className={`subtle mt-2 ${motionClassNames.fadeIn}`} style={getStaggerStyle(1)}>
        Match {matchId} · status: {match?.status ?? 'loading'} · turn member: {match?.turnMemberId ?? 'n/a'}
      </p>

      {matchQuery.data?.participantState ? (
        <div className={`card mt-4 ${motionClassNames.sectionEntry}`} style={getStaggerStyle(2)}>
          <p className="text-sm">
            Secret target image ID:{' '}
            <strong>{matchQuery.data.participantState.secretTargetImageId}</strong>
          </p>
        </div>
      ) : (
        <div className={`card mt-4 ${motionClassNames.sectionEntry}`} style={getStaggerStyle(2)}>
          <p className="subtle text-sm">Spectator mode: secret participant state hidden.</p>
        </div>
      )}

      <section className={`card mt-4 ${motionClassNames.sectionEntry}`} style={getStaggerStyle(3)}>
        <h2 className="text-lg font-semibold">Board IDs</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {boardImages.map((imageId, index) => (
            <div
              key={imageId}
              className={`rounded-lg border border-white/20 p-2 text-xs ${motionClassNames.listItemEntry}`}
              style={getStaggerStyle(index, 24, 180)}
            >
              {imageId}
            </div>
          ))}
        </div>
      </section>

      <section className={`card mt-4 ${motionClassNames.sectionEntry}`} style={getStaggerStyle(4)}>
        <h2 className="text-lg font-semibold">Turn Actions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn btn-secondary" onClick={() => actionMutation.mutate({ actionType: 'ask', payload: {} })} type="button">
            Ask
          </button>
          <button className="btn btn-secondary" onClick={() => actionMutation.mutate({ actionType: 'answer', payload: {} })} type="button">
            Answer
          </button>
        </div>
        <form className="field mt-3" onSubmit={(event) => onImageAction(event, 'eliminate')}>
          <label className="field">
            Image ID for eliminate/guess
            <input value={imageIdInput} onChange={(event) => setImageIdInput(event.target.value)} />
          </label>
          <div className="flex gap-2">
            <button className="btn btn-secondary" type="submit">
              Eliminate
            </button>
            <button className="btn btn-primary" type="button" onClick={submitGuess}>
              Guess
            </button>
          </div>
        </form>
        <button className="btn btn-danger mt-3" onClick={() => forfeitMutation.mutate()} type="button">
          Forfeit Match
        </button>
      </section>

      <section className={`card mt-4 ${motionClassNames.sectionEntry}`} style={getStaggerStyle(5)}>
        <h2 className="text-lg font-semibold">Room Chat</h2>
        <div className="card-list">
          {chatQuery.data?.items.map((item, index) => (
            <div
              key={item._id}
              className={`card ${motionClassNames.listItemEntry}`}
              style={getStaggerStyle(index, 24, 200)}
            >
              <p className="text-sm">{item.message}</p>
              <p className="subtle text-xs">{item.memberId} · {new Date(item.createdAt).toLocaleTimeString()}</p>
            </div>
          ))}
        </div>
        <form className="field mt-3" onSubmit={onSendChat}>
          <input value={chatMessage} onChange={(event) => setChatMessage(event.target.value)} placeholder="Send message" />
          <button className="btn btn-secondary" type="submit" disabled={sendChatMutation.isPending}>
            Send
          </button>
        </form>
      </section>

      <section className={`card mt-4 ${motionClassNames.sectionEntry}`} style={getStaggerStyle(6)}>
        <h2 className="text-lg font-semibold">Action Timeline</h2>
        <div className="card-list">
          {matchQuery.data?.actions.map((action, index) => (
            <div
              key={action._id}
              className={`card ${motionClassNames.listItemEntry}`}
              style={getStaggerStyle(index, 22, 180)}
            >
              <p className="text-sm font-medium">{action.actionType}</p>
              <p className="subtle text-xs">Actor: {action.actorMemberId ?? 'system'}</p>
            </div>
          ))}
        </div>
      </section>

      {isCompleted ? (
        <div className={`mt-5 flex gap-2 ${motionClassNames.fadeIn}`} style={getStaggerStyle(7)}>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() =>
              void navigate({
                to: '/rooms/$roomId/matches/$matchId/summary',
                params: { roomId, matchId },
              })
            }
          >
            View Summary
          </button>
          <Link className="btn btn-secondary" to="/rooms/$roomId/matches/$matchId/replay" params={{ roomId, matchId }}>
            Replay
          </Link>
          <Link className="btn btn-secondary" to="/rooms/$roomId/lobby" params={{ roomId }}>
            Back to Lobby
          </Link>
        </div>
      ) : null}
    </div>
  )
}
