import type { Schemas } from '~/api/types'

export type FormAnswerValue = Schemas['FormResponseAnswer']

/** Заполненные поля формы: «имя элемента схемы → значение» */
export type FormAnswers = Record<string, FormAnswerValue>

export function isEmptyAnswer(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return true
  if (Array.isArray(value)) return value.length === 0
  return false
}
