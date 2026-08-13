import { z } from 'zod'
import type { FormElement, FormPage } from './schema/form-schema.schema'
import { formSchemaObject } from './schema/form-schema.schema'

export const formEditorSchema = z.object({
  id: z.uuid().optional(),

  title: z.string().trim().min(1, 'Title is required').max(500),

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
