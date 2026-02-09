import { useSyncExternalStore } from 'react'
import { sessionStore } from '@/stores/sessionStore'

export const useSession = () =>
  useSyncExternalStore(sessionStore.subscribe, sessionStore.getState)
