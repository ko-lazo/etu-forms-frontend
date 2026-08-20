import type { FormInput } from './input'

export interface FormInputSnapshot {
  input: FormInput
  submitted: boolean
}

/**
 * Где хранится ввод между сессиями и куда он уходит при отправке
 */
export interface FormInputStorage {
  load?: () => Promise<FormInputSnapshot | null>
  save?: (input: FormInput) => void
  submit: (input: FormInput) => Promise<void>
}

export class InputRejectedError extends Error {
  readonly fieldErrors: Record<string, string>

  constructor(fieldErrors: Record<string, string>) {
    super('Ввод отклонён')

    this.name = 'InputRejectedError'
    this.fieldErrors = fieldErrors
  }
}
