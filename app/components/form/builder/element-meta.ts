import type { FormElement, FormElementType } from '~/types/form/schema/form-schema.schema.ts'

interface ElementTypeMeta {
  type: FormElementType
  label: string
  icon: string
  hasChoices: boolean
}

export const ELEMENT_TYPES: ElementTypeMeta[] = [
  { type: 'text', label: 'Текст (строка)', icon: 'i-lucide-type', hasChoices: false },
  { type: 'textarea', label: 'Текст (абзац)', icon: 'i-lucide-align-left', hasChoices: false },
  { type: 'email', label: 'Email', icon: 'i-lucide-at-sign', hasChoices: false },
  { type: 'number', label: 'Число', icon: 'i-lucide-hash', hasChoices: false },
  { type: 'dropdown', label: 'Выпадающий список', icon: 'i-lucide-chevron-down-circle', hasChoices: true },
  { type: 'radiogroup', label: 'Выбор одного варианта', icon: 'i-lucide-circle-dot', hasChoices: true },
  { type: 'checkbox', label: 'Выбор нескольких вариантов', icon: 'i-lucide-square-check', hasChoices: true },
  { type: 'file', label: 'Файл', icon: 'i-lucide-paperclip', hasChoices: false }
]

export function metaFor(type: FormElementType): ElementTypeMeta {
  return ELEMENT_TYPES.find(item => item.type === type) ?? ELEMENT_TYPES[0]!
}

let counter = 0

function nextName(prefix: string): string {
  counter += 1
  return `${prefix}${counter}`
}

export function createElement(type: FormElementType): FormElement {
  const base = {
    name: nextName('field'),
    label: metaFor(type).label,
    required: false
  }

  switch (type) {
    case 'text':
    case 'email':
    case 'textarea':
      return { ...base, type }

    case 'number':
      return { ...base, type: 'number' }

    case 'dropdown':
    case 'radiogroup':
    case 'checkbox':
      return {
        ...base,
        type,
        choices: [
          { value: 'option_1', text: 'Вариант 1' },
          { value: 'option_2', text: 'Вариант 2' }
        ]
      }

    case 'file':
      return { ...base, type: 'file' }
  }
}
