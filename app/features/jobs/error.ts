import type { Schemas } from '~/api/types'
import type { JobFailure } from './types'
import { isApiError } from '~/api/error'

type ErrorCode = Schemas['DomainError']['code']

const FAILURE_FALLBACK = 'Задача завершилась ошибкой'

const FAILURE_MESSAGES: Record<string, string> = {
  INVALID_PAYLOAD: 'Задача с неверными параметрами',
  UNKNOWN_JOB_TYPE: 'Неизвестный тип задачи',
  ENQUEUE_FAILED: 'Не удалось поставить задачу в очередь',
  FORM_NOT_FOUND: 'Форма для выгрузки была удалена',
  EXPORT_TOO_LARGE: 'Слишком много данных для выгрузки',
  INTERNAL_ERROR: 'Внутренняя ошибка при выполнении задачи'
}

export function toJobFailureMessage(failure: JobFailure | null): string {
  if (!failure) return FAILURE_FALLBACK
  return FAILURE_MESSAGES[failure.code] ?? FAILURE_FALLBACK
}

const REQUEST_FALLBACK = 'Не удалось выполнить действие с задачей'

const REQUEST_MESSAGES: Partial<Record<ErrorCode, string>> = {
  BAD_REQUEST: 'Задача уже завершена',
  FORBIDDEN: 'Нет доступа к задаче',
  NOT_FOUND: 'Задача не найдена',
  SERVICE_UNAVAILABLE: 'Сервис фоновых задач временно недоступен'
}

export function toJobErrorMessage(error: unknown): string {
  if (!isApiError(error) || !error.code) return REQUEST_FALLBACK
  return REQUEST_MESSAGES[error.code] ?? REQUEST_FALLBACK
}
