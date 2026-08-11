import { z } from 'zod'
import { formSchemaObject } from './schema/form-schema.schema'

export const formEditorSchema = z.object({
  id: z.uuid().optional(),

  title: z.string().trim().min(1, 'Title is required').max(500),

  schema: formSchemaObject,

  settings: z.record(z.string(), z.unknown()).default({})
})

export type FormEditorModel = z.infer<typeof formEditorSchema>
