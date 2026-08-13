import type { FormPage } from '~/types/form/schema/form-schema.schema'
import type { FormAnswers } from '~/utils/answer'
import { isEmptyAnswer } from '~/utils/answer'
import { validateFormResponse } from '~/utils/form-response.validator'

export function validateAnswers(pages: FormPage[], answers: FormAnswers): Record<string, string> {
  const errors: Record<string, string> = {}
  const filled: FormAnswers = {}

  for (const field of pages.flatMap(page => page.elements)) {
    const answer = answers[field.name]

    if (answer === undefined || isEmptyAnswer(answer)) {
      if (field.required) errors[field.name] = 'Обязательное поле'
      continue
    }

    filled[field.name] = answer
  }

  for (const { field, message } of validateFormResponse({ pages }, filled)) {
    errors[field] ??= message
  }

  return errors
}
