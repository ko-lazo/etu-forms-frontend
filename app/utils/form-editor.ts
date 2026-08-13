import { toRaw } from 'vue'
import type { ZodError } from 'zod'
import type { Form } from '~/types/form/form'
import type { EditorModel, EditorPage } from '~/types/form/editor'
import type { FormSchemaDto } from '~/types/form/schema/form-schema.schema'
import { formEditorSchema } from '~/types/form/editor'
import { createUid } from '~/utils/uid'

function withUids(schema: FormSchemaDto): { pages: EditorPage[] } {
  return {
    pages: schema.pages.map(page => ({
      ...page,
      elements: page.elements.map(element => ({ ...element, _uid: createUid() }))
    }))
  }
}

export function createEmptyFormEditorModel(): EditorModel {
  return {
    title: '',
    schema: {
      pages: [
        { name: 'page1', title: 'Страница 1', elements: [] }
      ]
    },
    settings: {}
  }
}

export function formToEditorModel(form: Form): EditorModel {
  return {
    id: form.id,
    title: form.title,
    schema: withUids(form.schema),
    settings: form.settings
  }
}

/**
 * Приводит модель редактора к контракту API: валидирует её и вырезает
 * служебные поля редактора (`_uid`)
 */
export function parseEditorModelToPayload(model: EditorModel) {
  return formEditorSchema.safeParse(structuredClone(toRaw(model)))
}

export function formatValidationError(error: ZodError): string {
  const issue = error.issues[0]
  if (!issue) return 'Проверьте заполнение полей'

  const path = issue.path.map(String).join('.')
  return path ? `${path}: ${issue.message}` : issue.message
}
