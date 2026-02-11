// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PageTransition from '@/components/PageTransition'

describe('PageTransition', () => {
  it('renders children with route key metadata and motion class', () => {
    render(
      <PageTransition routeKey="rooms-index">
        <div>Rooms</div>
      </PageTransition>,
    )

    const container = screen.getByText('Rooms').parentElement
    expect(container?.getAttribute('data-route-key')).toBe('rooms-index')
    expect(container?.className).toContain('motion-page-entry')
  })
})

