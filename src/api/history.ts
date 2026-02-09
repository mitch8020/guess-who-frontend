import { matchesApi } from '@/api/matches'

export const historyApi = {
  list: matchesApi.history,
  replay: matchesApi.replay,
}
