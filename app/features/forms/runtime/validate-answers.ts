import type { FormPage } from '../schema/form-schema'
import type { FormAnswers } from './answers'
import { isEmptyAnswer } from './answers'

const REQUIRED_MESSAGE = 'Обязательное поле'

export function validateRequiredAnswers(
  pages: FormPage[],
  answers: FormAnswers
): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const element of pages.flatMap(page => page.elements)) {
    if (!element.required) continue

    const answer = answers[element.name]

    if (answer === undefined || isEmptyAnswer(answer)) {
      errors[element.name] = REQUIRED_MESSAGE
    }
  }

  return errors
}
