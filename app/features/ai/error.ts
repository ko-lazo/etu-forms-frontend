import type { Schemas } from '~/api/types'
import { isApiError } from '~/api/error'

type ErrorCode = Schemas['DomainError']['code']

const FALLBACK = 'Не удалось получить ответ от ИИ'

const MESSAGES: Partial<Record<ErrorCode, string>> = {
  BAD_REQUEST: 'Запрос не подошёл: опишите нужную форму подробнее',
  FORBIDDEN: 'Нет доступа к этой форме',
  NOT_FOUND: 'Форма не найдена - возможно, она уже удалена',
  TOO_MANY_REQUESTS: 'Суточный лимит запросов к ИИ исчерпан',
  SERVICE_UNAVAILABLE: 'ИИ-сервис временно недоступен, попробуйте позже'
}

export function toAiErrorMessage(error: unknown): string {
  if (!isApiError(error) || !error.code) return FALLBACK

  return MESSAGES[error.code] ?? FALLBACK
}
