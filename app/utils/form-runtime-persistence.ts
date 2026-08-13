import type { FormAnswers } from '~/utils/answer'

export interface FormRuntimeDraft {
  answers: FormAnswers
  submitted: boolean
}

/**
 * Способ хранения ответов.
 * публичная страница передаёт API-реализацию, предпросмотр - заглушку.
 */
export interface FormRuntimePersistence {
  loadDraft?: () => Promise<FormRuntimeDraft | null>
  saveDraft?: (answers: FormAnswers) => Promise<void>
  submit: (answers: FormAnswers) => Promise<void>
}

/**
 * Предпросмотр: ничего не загружает, не сохраняет и не отправляет.
 */
export function createPreviewPersistence(): FormRuntimePersistence {
  return {
    submit: () => Promise.resolve()
  }
}
