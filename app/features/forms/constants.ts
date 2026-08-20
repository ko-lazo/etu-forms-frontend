import type { FormStatus } from './types'

export const FORM_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
} as const satisfies Record<string, FormStatus>

interface FormStatusMeta {
  label: string
  color: 'neutral' | 'info' | 'success' | 'warning'
  dot: string
}

export const FORM_STATUS_META: Record<FormStatus, FormStatusMeta> = {
  [FORM_STATUS.DRAFT]: {
    label: 'Черновик',
    color: 'neutral',
    dot: 'bg-neutral-400 dark:bg-neutral-500'
  },
  [FORM_STATUS.SCHEDULED]: {
    label: 'Отложенная публикация',
    color: 'info',
    dot: 'bg-info'
  },
  [FORM_STATUS.PUBLISHED]: {
    label: 'Опубликована',
    color: 'success',
    dot: 'bg-success'
  },
  [FORM_STATUS.ARCHIVED]: {
    label: 'В архиве',
    color: 'warning',
    dot: 'bg-warning'
  }
}
