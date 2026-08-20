import type { Schemas } from '~/api/types'

export type FormInputValue = Schemas['FormResponseAnswer']

/** Заполненные поля формы: «имя элемента схемы → значение» */
export type FormInput = Record<string, FormInputValue>

export function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return true
  if (Array.isArray(value)) return value.length === 0
  return false
}
