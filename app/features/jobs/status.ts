import type { Job, JobStatus } from './types'
import { JOB_STATUS } from './constants'

const FINAL_STATUSES: JobStatus[] = [
  JOB_STATUS.SUCCEEDED,
  JOB_STATUS.FAILED,
  JOB_STATUS.CANCELLED
]

export function isJobActive(job: Job): boolean {
  return !FINAL_STATUSES.includes(job.status)
}

export function isJobDownloadable(job: Job): boolean {
  return job.status === JOB_STATUS.SUCCEEDED && Boolean(job.result?.file)
}
