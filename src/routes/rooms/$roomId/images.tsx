import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { imagesApi } from '@/api/images'
import { queryClient } from '@/api/queryClient'
import { useRealtimeRoom } from '@/hooks/useRealtime'
import { getStaggerStyle, motionClassNames } from '@/utils/motion'

export const Route = createFileRoute('/rooms/$roomId/images')({
  component: RoomImagesPage,
})

function RoomImagesPage() {
  const { roomId } = Route.useParams()
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  useRealtimeRoom(roomId)

  const imagesQuery = useQuery({
    queryKey: ['images', roomId],
    queryFn: () => imagesApi.list(roomId),
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => imagesApi.upload(roomId, file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['images', roomId] })
      setError(null)
    },
    onError: (caughtError) => {
      setError(caughtError instanceof Error ? caughtError.message : 'Upload failed.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (imageId: string) => imagesApi.remove(roomId, imageId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['images', roomId] })
    },
  })

  const bulkRemoveMutation = useMutation({
    mutationFn: () => imagesApi.bulkRemove(roomId, selected),
    onSuccess: async () => {
      setSelected([])
      await queryClient.invalidateQueries({ queryKey: ['images', roomId] })
    },
  })

  const onFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    uploadMutation.mutate(file)
    event.target.value = ''
  }

  return (
    <div className={`panel ${motionClassNames.sectionEntry}`}>
      <h1 className={`page-title text-3xl ${motionClassNames.fadeIn}`}>Room Image Library</h1>
      <p className={`subtle mt-2 ${motionClassNames.fadeIn}`} style={getStaggerStyle(1)}>
        Active images: {imagesQuery.data?.activeCount ?? 0} · minimum to start: {imagesQuery.data?.minRequiredToStart ?? 16}
      </p>
      <label className={`field mt-4 ${motionClassNames.sectionEntry}`} style={getStaggerStyle(2)}>
        Upload JPEG/PNG/WebP (max 10MB)
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFileSelected} />
      </label>
      {error ? <p className="danger-text mt-2">{error}</p> : null}
      {selected.length > 0 ? (
        <button
          type="button"
          className={`btn btn-danger mt-3 ${motionClassNames.fadeIn}`}
          style={getStaggerStyle(3)}
          onClick={() => bulkRemoveMutation.mutate()}
        >
          Bulk Remove ({selected.length})
        </button>
      ) : null}

      <div className="card-list">
        {imagesQuery.data?.images.map((image, index) => (
          <article
            key={image._id}
            className={`card flex items-center justify-between gap-3 ${motionClassNames.listItemEntry}`}
            style={getStaggerStyle(index, 30, 260)}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selected.includes(image._id)}
                onChange={(event) =>
                  setSelected((current) =>
                    event.target.checked
                      ? [...current, image._id]
                      : current.filter((id) => id !== image._id),
                  )
                }
              />
              <div>
                <h2 className="text-sm font-semibold">{image.filename}</h2>
                <p className="subtle text-xs">
                  {image.mimeType} · {Math.round(image.fileSizeBytes / 1024)} KB
                </p>
              </div>
            </div>
            <button type="button" className="btn btn-danger" onClick={() => deleteMutation.mutate(image._id)}>
              Remove
            </button>
          </article>
        ))}
      </div>
    </div>
  )
}
