import type { Schemas } from '~/api/types'
import { isApiError } from '~/api/error'

type ValidationError = Schemas['FormResponseValidationError']
type ErrorCode = ValidationError['code']
type ErrorParams = NonNullable<ValidationError['params']>

const CHARACTERS: [string, string, string] = ['символ', 'символа', 'символов']

const MESSAGES: Record<ErrorCode, (params: ErrorParams) => string> = {
  REQUIRED: () => 'Обязательное поле',
  UNKNOWN_FIELD: () => 'Такого поля нет в форме',
  INVALID_TYPE: ({ expected }) => {
    if (expected === 'number') return 'Ответ должен быть числом'
    if (expected === 'array') return 'Ответ должен быть списком значений'
    return 'Ответ должен быть строкой'
  },
  INVALID_EMAIL: () => 'Введите корректный email',
  TOO_SHORT: ({ minLength }) => `Минимум ${minLength} ${pluralize(Number(minLength), CHARACTERS)}`,
  TOO_LONG: ({ maxLength }) => `Максимум ${maxLength} ${pluralize(Number(maxLength), CHARACTERS)}`,
  TOO_SMALL: ({ min }) => `Минимальное значение - ${min}`,
  TOO_LARGE: ({ max }) => `Максимальное значение - ${max}`,
  INVALID_CHOICE: ({ value }) => `Недопустимый вариант: "${value}"`
}

function isValidationError(value: unknown): value is ValidationError {
  return (
    typeof value === 'object'
    && value !== null
    && typeof (value as ValidationError).field === 'string'
    && (value as ValidationError).code in MESSAGES
  )
}

export function toFieldErrors(error: unknown): Record<string, string> {
  if (!isApiError(error) || !Array.isArray(error.details)) return {}

  const errors: Record<string, string> = {}

  for (const detail of error.details) {
    if (isValidationError(detail)) {
      errors[detail.field] ??= MESSAGES[detail.code](detail.params ?? {})
    }
  }

  return errors
}
