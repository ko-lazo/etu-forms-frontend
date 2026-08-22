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

export const FORM_TRANSITION = {
  PUBLISH: 'publish',
  UNPUBLISH: 'unpublish',
  ARCHIVE: 'archive',
  UNARCHIVE: 'unarchive'
} as const

export type FormTransition = typeof FORM_TRANSITION[keyof typeof FORM_TRANSITION]

interface FormTransitionMeta {
  label: string
  icon: string
  success: string
}

export const FORM_TRANSITION_META: Record<FormTransition, FormTransitionMeta> = {
  [FORM_TRANSITION.PUBLISH]: {
    label: 'Опубликовать',
    icon: 'i-lucide-rocket',
    success: 'Форма опубликована'
  },
  [FORM_TRANSITION.UNPUBLISH]: {
    label: 'Снять с публикации',
    icon: 'i-lucide-eye-off',
    success: 'Форма снята с публикации'
  },
  [FORM_TRANSITION.ARCHIVE]: {
    label: 'В архив',
    icon: 'i-lucide-archive',
    success: 'Форма в архиве'
  },
  [FORM_TRANSITION.UNARCHIVE]: {
    label: 'Вернуть из архива',
    icon: 'i-lucide-archive-restore',
    success: 'Форма возвращена из архива'
  }
}

export const FORM_TRANSITIONS: Record<FormStatus, FormTransition[]> = {
  [FORM_STATUS.DRAFT]: [
    FORM_TRANSITION.PUBLISH,
    FORM_TRANSITION.ARCHIVE
  ],
  [FORM_STATUS.SCHEDULED]: [
    FORM_TRANSITION.PUBLISH,
    FORM_TRANSITION.UNPUBLISH,
    FORM_TRANSITION.ARCHIVE
  ],
  [FORM_STATUS.PUBLISHED]: [
    FORM_TRANSITION.UNPUBLISH,
    FORM_TRANSITION.ARCHIVE
  ],
  [FORM_STATUS.ARCHIVED]: [
    FORM_TRANSITION.UNARCHIVE
  ]
}
