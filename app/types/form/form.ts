import { z } from 'zod'
import { formSchemaObject } from './schema/form-schema.schema'

export const formResponseSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  title: z.string(),
  schema: formSchemaObject,
  settings: z.record(z.string(), z.unknown()),
  publishedAt: z.string().nullable(),
  archivedAt: z.string().nullable(),
  createdAt: z.string()
})

export type Form = z.infer<typeof formResponseSchema>
