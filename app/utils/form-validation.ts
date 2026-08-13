import type { FormElement } from '~/types/form/schema/form-schema.schema'
import { isEmptyAnswer } from '~/utils/answer'

export function validateAnswers(fields: FormElement[], answers: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const field of fields) {
    if (field.required && isEmptyAnswer(answers[field.name])) {
      errors[field.name] = 'Обязательное поле'
    }
  }

  return errors
}
