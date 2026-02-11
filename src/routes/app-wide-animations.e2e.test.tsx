// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router'
import * as realtimeHooks from '@/hooks/useRealtime'
import { imagesApi } from '@/api/images'
import { matchesApi } from '@/api/matches'
import { chatApi } from '@/api/chat'
import { routeTree } from '@/routeTree.gen'
import { sessionStore } from '@/stores/sessionStore'
import { motionClassNames } from '@/utils/motion'

function renderAtPath(pathname: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const router = createRouter({
    routeTree,
    context: {},
    history: createMemoryHistory({ initialEntries: [pathname] }),
    defaultPreload: false,
  })

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

afterEach(() => {
  vi.restoreAllMocks()
  window.localStorage.clear()
  sessionStore.setState({
    accessToken: null,
    refreshToken: null,
    user: null,
    guestTokensByRoomId: {},
  })
})

describe('app-wide motion route coverage', () => {
  it('applies motion class hooks in a public flow', async () => {
    vi.spyOn(realtimeHooks, 'useRealtimeRoom').mockImplementation(() => undefined)

    renderAtPath('/')

    const heading = await screen.findByRole('heading', {
      name: /Play fast 1v1 Guess Who matches with your own photo boards\./i,
    })
    expect(heading.className).toContain(motionClassNames.fadeIn)

    const signInCardTitle = await screen.findByRole('heading', { name: 'Google Sign-In' })
    expect(signInCardTitle.closest('section')?.className).toContain(motionClassNames.listItemEntry)
  })

  it('applies motion class hooks in a room-management flow', async () => {
    vi.spyOn(realtimeHooks, 'useRealtimeRoom').mockImplementation(() => undefined)
    vi.spyOn(imagesApi, 'list').mockResolvedValue({
      activeCount: 2,
      minRequiredToStart: 16,
      images: [
        { _id: 'img-1', filename: 'cat-1.jpg', mimeType: 'image/jpeg', fileSizeBytes: 150_000 },
        { _id: 'img-2', filename: 'cat-2.jpg', mimeType: 'image/jpeg', fileSizeBytes: 180_000 },
      ],
    } as any)

    renderAtPath('/rooms/room-1/images')

    const title = await screen.findByRole('heading', { name: 'Room Image Library' })
    expect(title.className).toContain(motionClassNames.fadeIn)

    const firstImageName = await screen.findByText('cat-1.jpg')
    expect(firstImageName.closest('article')?.className).toContain(motionClassNames.listItemEntry)
  })

  it('applies motion class hooks in a match flow', async () => {
    vi.spyOn(realtimeHooks, 'useRealtimeRoom').mockImplementation(() => undefined)
    vi.spyOn(matchesApi, 'detail').mockResolvedValue({
      match: {
        _id: 'match-1',
        status: 'active',
        turnMemberId: 'member-2',
        selectedImageIds: ['img-1', 'img-2'],
      },
      participantState: {
        secretTargetImageId: 'img-1',
        boardImageOrder: ['img-1', 'img-2'],
      },
      actions: [{ _id: 'action-1', actionType: 'ask', actorMemberId: 'member-1' }],
    } as any)
    vi.spyOn(chatApi, 'list').mockResolvedValue({
      items: [{ _id: 'chat-1', message: 'hello team', memberId: 'member-1', createdAt: '2026-02-11T00:00:00.000Z' }],
      nextCursor: null,
    } as any)

    renderAtPath('/rooms/room-1/matches/match-1')

    const timelineHeading = await screen.findByRole('heading', { name: 'Action Timeline' })
    expect(timelineHeading.closest('section')?.className).toContain(motionClassNames.sectionEntry)

    const chatMessage = await screen.findByText('hello team')
    expect(chatMessage.closest('div')?.className).toContain(motionClassNames.listItemEntry)
  })
})
