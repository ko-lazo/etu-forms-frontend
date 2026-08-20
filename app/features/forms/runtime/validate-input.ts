import type { FormPage } from '../schema/form-schema'
import type { FormInput } from './input'
import { isEmptyValue } from './input'

const REQUIRED_MESSAGE = 'Обязательное поле'

export function validateRequiredFields(
  pages: FormPage[],
  input: FormInput
): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const element of pages.flatMap(page => page.elements)) {
    if (!element.required) continue

    if (isEmptyValue(input[element.name])) {
      errors[element.name] = REQUIRED_MESSAGE
    }
  }

  return errors
}
