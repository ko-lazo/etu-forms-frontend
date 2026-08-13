import type { FormSchemaDto } from '~/types/form/schema/form-schema.schema.ts'
import type { FormResponse } from '~/types/form/response.ts'
import { pluralize } from '~/utils/plural.ts'

type Answers = FormResponse['answers']
type Answer = Answers[string]

type FormElement = FormSchemaDto['pages'][number]['elements'][number]

export interface FormResponseValidationError {
  field: string
  message: string
}

export function validateFormResponse(
  schema: FormSchemaDto,
  answers: Answers
): FormResponseValidationError[] {
  const errors: FormResponseValidationError[] = []

  const elements = schema.pages.flatMap(page => page.elements)

  const elementsByName = new Map(
    elements.map(element => [element.name, element])
  )

  for (const element of elements) {
    const answer = answers[element.name]

    if (answer === undefined) {
      if (element.required) {
        errors.push({
          field: element.name,
          message: 'Обязательное поле'
        })
      }

      continue
    }

    validateElementAnswer(element, answer, errors)
  }

  for (const fieldName of Object.keys(answers)) {
    if (!elementsByName.has(fieldName)) {
      errors.push({
        field: fieldName,
        message: `Неизвестное поле: "${fieldName}"`
      })
    }
  }

  return errors
}

function validateElementAnswer(
  element: FormElement,
  answer: Answer,
  errors: FormResponseValidationError[]
): void {
  switch (element.type) {
    case 'text':
    case 'email':
    case 'textarea':
      validateTextAnswer(element, answer, errors)
      return

    case 'number':
      validateNumberAnswer(element, answer, errors)
      return

    case 'dropdown':
    case 'radiogroup':
      validateSingleChoiceAnswer(element, answer, errors)
      return

    case 'checkbox':
      validateCheckboxAnswer(element, answer, errors)
      return

    case 'file':
      validateFileAnswer(element, answer, errors)
      return
  }
}

function validateTextAnswer(
  element: FormElement,
  answer: Answer,
  errors: FormResponseValidationError[]
): void {
  if (
    element.type !== 'text'
    && element.type !== 'email'
    && element.type !== 'textarea'
  ) {
    return
  }

  if (typeof answer !== 'string') {
    errors.push({
      field: element.name,
      message: 'Ответ должен быть строкой'
    })

    return
  }

  const validation = element.validation

  if (
    validation?.minLength !== undefined
    && answer.length < validation.minLength
  ) {
    errors.push({
      field: element.name,
      message: `Минимум ${validation.minLength} ${pluralize(validation.minLength, ['символ', 'символа', 'символов'])}`
    })
  }

  if (
    validation?.maxLength !== undefined
    && answer.length > validation.maxLength
  ) {
    errors.push({
      field: element.name,
      message: `Максимум ${validation.maxLength} ${pluralize(validation.maxLength, ['символ', 'символа', 'символов'])}`
    })
  }

  if (element.type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(answer)) {
      errors.push({
        field: element.name,
        message: 'Введите корректный email'
      })
    }
  }
}

function validateNumberAnswer(
  element: FormElement,
  answer: Answer,
  errors: FormResponseValidationError[]
): void {
  if (element.type !== 'number') {
    return
  }

  if (typeof answer !== 'number' || !Number.isFinite(answer)) {
    errors.push({
      field: element.name,
      message: 'Ответ должен быть числом'
    })

    return
  }

  const validation = element.validation

  if (validation?.min !== undefined && answer < validation.min) {
    errors.push({
      field: element.name,
      message: `Минимальное значение - ${validation.min}`
    })
  }

  if (validation?.max !== undefined && answer > validation.max) {
    errors.push({
      field: element.name,
      message: `Максимальное значение - ${validation.max}`
    })
  }
}

function validateSingleChoiceAnswer(
  element: FormElement,
  answer: Answer,
  errors: FormResponseValidationError[]
): void {
  if (element.type !== 'dropdown' && element.type !== 'radiogroup') {
    return
  }

  if (typeof answer !== 'string') {
    errors.push({
      field: element.name,
      message: 'Ответ должен быть строкой'
    })

    return
  }

  const allowedValues = new Set(element.choices.map(choice => choice.value))

  if (!allowedValues.has(answer)) {
    errors.push({
      field: element.name,
      message: `Недопустимый вариант: "${answer}"`
    })
  }
}

function validateCheckboxAnswer(
  element: FormElement,
  answer: Answer,
  errors: FormResponseValidationError[]
): void {
  if (element.type !== 'checkbox') {
    return
  }

  if (!Array.isArray(answer)) {
    errors.push({
      field: element.name,
      message: 'Ответ должен быть списком значений'
    })

    return
  }

  const allowedValues = new Set(element.choices.map(choice => choice.value))

  for (const value of answer) {
    if (!allowedValues.has(value)) {
      errors.push({
        field: element.name,
        message: `Недопустимый вариант: "${value}"`
      })
    }
  }
}

function validateFileAnswer(
  element: FormElement,
  answer: Answer,
  errors: FormResponseValidationError[]
): void {
  if (element.type !== 'file') {
    return
  }

  if (typeof answer === 'string') {
    return
  }

  if (!Array.isArray(answer)) {
    errors.push({
      field: element.name,
      message: 'Некорректный ответ с файлами'
    })

    return
  }

  const maxFilesCount = element.validation?.maxFilesCount ?? 1

  if (answer.length > maxFilesCount) {
    errors.push({
      field: element.name,
      message: `Не более ${maxFilesCount} ${pluralize(maxFilesCount, ['файла', 'файлов', 'файлов'])}`
    })
  }
}
