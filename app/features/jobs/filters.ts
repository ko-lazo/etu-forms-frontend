import type { JobListQuery } from './api'
import type { JobStatus } from './types'
import { JOB_STATUS_FILTER_ALL } from './constants'

type JobStatusFilter = JobStatus | typeof JOB_STATUS_FILTER_ALL

export interface JobFilters {
  status: JobStatusFilter
  createdFrom: string
  createdTo: string
}

export function createJobFilters(): JobFilters {
  return {
    status: JOB_STATUS_FILTER_ALL,
    createdFrom: '',
    createdTo: ''
  }
}

export function toJobListQuery(filters: JobFilters): JobListQuery {
  return {
    status: filters.status === JOB_STATUS_FILTER_ALL ? undefined : filters.status,
    createdFrom: toDayStart(filters.createdFrom),
    createdTo: toDayEnd(filters.createdTo)
  }
}
