import { Outlet, createRootRoute, useRouterState } from '@tanstack/react-router'

import Header from '../components/Header'
import PageTransition from '../components/PageTransition'

function RootLayout() {
  const routeKey = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <div className="app-shell">
      <Header />
      <PageTransition routeKey={routeKey}>
        <Outlet />
      </PageTransition>
    </div>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
