import { apiRequest } from '@/api/client'
import type { RoomImage } from '@/types/domain'

export const imagesApi = {
  list: (roomId: string) =>
    apiRequest<{
      images: RoomImage[]
      activeCount: number
      minRequiredToStart: number
    }>(`/rooms/${roomId}/images`, {
      auth: 'player',
      roomId,
    }),
  upload: async (roomId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiRequest<{ image: RoomImage }>(`/rooms/${roomId}/images`, {
      method: 'POST',
      body: formData,
      auth: 'player',
      roomId,
    })
  },
  remove: (roomId: string, imageId: string) =>
    apiRequest<void>(`/rooms/${roomId}/images/${imageId}`, {
      method: 'DELETE',
      auth: 'player',
      roomId,
    }),
}
