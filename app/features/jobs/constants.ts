import type { JobStatus } from './types'

export const JOB_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
} as const satisfies Record<string, JobStatus>

export const JOB_TYPE = {
  RESPONSES_EXPORT: 'form-responses.export'
} as const

export const JOB_TYPE_LABEL: Record<string, string> = {
  [JOB_TYPE.RESPONSES_EXPORT]: 'Выгрузка ответов'
}

interface JobStatusMeta {
  label: string
  color: 'neutral' | 'info' | 'success' | 'error' | 'warning'
  icon: string
}

export const JOB_STATUS_META: Record<JobStatus, JobStatusMeta> = {
  [JOB_STATUS.PENDING]: {
    label: 'В очереди',
    color: 'neutral',
    icon: 'i-lucide-clock'
  },
  [JOB_STATUS.RUNNING]: {
    label: 'Выполняется',
    color: 'info',
    icon: 'i-lucide-loader'
  },
  [JOB_STATUS.SUCCEEDED]: {
    label: 'Готова',
    color: 'success',
    icon: 'i-lucide-check'
  },
  [JOB_STATUS.FAILED]: {
    label: 'Ошибка',
    color: 'error',
    icon: 'i-lucide-triangle-alert'
  },
  [JOB_STATUS.CANCELLED]: {
    label: 'Отменена',
    color: 'warning',
    icon: 'i-lucide-ban'
  }
}

export const JOB_STATUS_FILTER_ALL = 'all'

export const JOB_STATUS_FILTER_ITEMS = [
  {
    label: 'Все',
    value: JOB_STATUS_FILTER_ALL
  },
  ...Object.values(JOB_STATUS).map(status => ({
    label: JOB_STATUS_META[status].label,
    value: status
  }))
]

export const JOB_STATUS_REFRESH_MS = 1500

export const EXPORT_FILE_NAME = 'export.xlsx'
