import { z } from 'zod'
import { formSchemaObject } from './schema/form-schema.schema'
import type { Form } from './api'

export const formEditorSchema = z.object({
  id: z.uuid().optional(),

  title: z.string().trim().min(1, 'Title is required').max(500),

  schema: formSchemaObject,

  settings: z.record(z.string(), z.unknown()).default({})
})

export type FormEditorModel = z.infer<typeof formEditorSchema>

export function createEmptyFormEditorModel(): FormEditorModel {
  return {
    title: '',
    schema: {
      pages: [
        { name: 'page1', title: 'Page 1', elements: [] }
      ]
    },
    settings: {}
  }
}

export function formToEditorModel(form: Form): FormEditorModel {
  return {
    id: form.id,
    title: form.title,
    schema: form.schema,
    settings: form.settings
  }
}
