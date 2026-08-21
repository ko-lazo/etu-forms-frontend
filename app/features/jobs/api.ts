import type { operations } from '~/api/schema'
import type { PaginatedResult } from '~/api/types'
import type { Job } from './types'
import { useHttp } from '~/api/http'

export type JobListQuery = NonNullable<operations['listJobs']['parameters']['query']>

export function useJobsApi() {
  const http = useHttp()

  return {
    list(query?: JobListQuery) {
      return http.get<PaginatedResult<Job>>('/jobs', { query })
    },

    get(id: string) {
      return http.get<Job>(`/jobs/${id}`)
    },

    cancel(id: string) {
      return http.post<Job>(`/jobs/${id}/cancel`)
    },

    downloadResult(id: string) {
      return http.download(`/jobs/${id}/download`)
    }
  }
}
