import { toRaw } from 'vue'
import { z, type ZodError } from 'zod'
import type { FormElement, FormPage, FormSchema } from '../schema/form-schema'
import type { Form } from '../types'
import { formSchemaObject } from '../schema/form-schema'
import { applyValidationDefaults } from './element-types'

export const EDITOR_MODE = {
  BUILD: 'build',
  PREVIEW: 'preview',
  AI: 'ai'
} as const

export type EditorMode = (typeof EDITOR_MODE)[keyof typeof EDITOR_MODE]

export const formEditorSchema = z.object({
  id: z.uuid().optional(),

  title: z.string().trim().min(1, 'Укажите название формы').max(500),

  schema: formSchemaObject,

  settings: z.record(z.string(), z.unknown()).default({})
})

export type FormEditorModel = z.infer<typeof formEditorSchema>

/**
 * Идентификатор для редактора форм. В FormSchema он не входит.
 */
type WithUid<T> = T extends unknown ? T & { _uid: string } : never

export type EditorElement = WithUid<FormElement>

export type EditorPage = Omit<FormPage, 'elements'> & { elements: EditorElement[] }

export type EditorModel = Omit<FormEditorModel, 'schema'> & { schema: { pages: EditorPage[] } }

export function createEmptyEditorModel(): EditorModel {
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
    schema: { pages: schemaToEditorPages(form.schema) },
    settings: form.settings
  }
}

export function schemaToEditorPages(schema: FormSchema): EditorPage[] {
  return schema.pages.map(page => ({
    ...page,
    elements: page.elements.map(element => applyValidationDefaults({ ...element, _uid: createUid() }))
  }))
}

/**
 * Приводит модель редактора к контракту API: валидирует её и вырезает
 * служебные поля редактора (`_uid`)
 */
export function parseEditorModel(model: EditorModel) {
  return formEditorSchema.safeParse(structuredClone(toRaw(model)))
}

export function formatEditorError(error: ZodError): string {
  const issue = error.issues[0]
  if (!issue) return 'Проверьте заполнение полей'

  const path = issue.path.map(String).join('.')
  return path ? `${path}: ${issue.message}` : issue.message
}
