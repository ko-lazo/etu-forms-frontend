import type { Schemas } from '~/api/types'
import { isApiError } from '~/api/error'

type ErrorCode = Schemas['DomainError']['code']

const LIFECYCLE_FALLBACK = 'Не удалось изменить статус формы'

const LIFECYCLE_MESSAGES: Partial<Record<ErrorCode, string>> = {
  BAD_REQUEST: 'Статус формы успел измениться - обновите страницу',
  FORBIDDEN: 'Менять статус формы может только владелец',
  NOT_FOUND: 'Форма не найдена - возможно, она удалена',
  TOO_MANY_REQUESTS: 'Превышен лимит запросов: подождите и попробуйте ещё раз'
}

export function toLifecycleErrorMessage(error: unknown): string {
  if (!isApiError(error) || !error.code) return LIFECYCLE_FALLBACK

  return LIFECYCLE_MESSAGES[error.code] ?? LIFECYCLE_FALLBACK
}
