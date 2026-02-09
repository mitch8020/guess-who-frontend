import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { queryClient } from '@/api/queryClient'
import { sessionStore } from '@/stores/sessionStore'

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL ?? 'ws://localhost:3001/ws'

export const useRealtimeRoom = (roomId: string, matchId?: string) => {
  useEffect(() => {
    const token = sessionStore.getPlayerToken(roomId)
    if (!token) {
      return
    }

    const socket = io(WS_BASE_URL, {
      transports: ['websocket'],
      auth: { token },
    })

    socket.emit('room.join', { roomId })
    if (matchId) {
      socket.emit('match.join', { roomId, matchId })
    }

    const roomRefresh = () => {
      void queryClient.invalidateQueries({ queryKey: ['room', roomId] })
      void queryClient.invalidateQueries({ queryKey: ['images', roomId] })
    }
    const matchRefresh = () => {
      if (matchId) {
        void queryClient.invalidateQueries({ queryKey: ['match', roomId, matchId] })
      }
    }

    socket.on('presence.updated', roomRefresh)
    socket.on('match.started', roomRefresh)
    socket.on('action.applied', matchRefresh)
    socket.on('turn.changed', matchRefresh)
    socket.on('match.completed', matchRefresh)

    return () => {
      socket.disconnect()
    }
  }, [matchId, roomId])
}
