import type { FormResponseAnswerValue } from '~/types/form/response'

export type FormAnswers = Record<string, FormResponseAnswerValue>

export function isEmptyAnswer(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return true
  if (Array.isArray(value)) return value.length === 0
  return false
}
