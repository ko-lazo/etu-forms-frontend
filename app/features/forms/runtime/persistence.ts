import type { FormAnswers } from './answers'

export interface FormRuntimeDraft {
  answers: FormAnswers
  submitted: boolean
}

export interface FormRuntimePersistence {
  loadDraft?: () => Promise<FormRuntimeDraft | null>
  saveDraft?: (answers: FormAnswers) => Promise<void>
  submit: (answers: FormAnswers) => Promise<void>
}

export class AnswersRejectedError extends Error {
  readonly fieldErrors: Record<string, string>

  constructor(fieldErrors: Record<string, string>) {
    super('Ответ отклонён')

    this.name = 'AnswersRejectedError'
    this.fieldErrors = fieldErrors
  }
}
