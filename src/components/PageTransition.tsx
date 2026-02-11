import type { ReactNode } from 'react'
import { motionClassNames } from '@/utils/motion'

type PageTransitionProps = {
  routeKey: string
  children: ReactNode
}

export default function PageTransition({ routeKey, children }: PageTransitionProps) {
  return (
    <div key={routeKey} data-route-key={routeKey} className={motionClassNames.pageEntry}>
      {children}
    </div>
  )
}
