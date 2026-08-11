import { z } from 'zod'
import { formSchemaObject } from '~/types/form/schema/form-schema.schema.ts'

export const formSchema = z.object({
  id: z.uuid().optional(),

  userId: z.uuid().optional(),

  title: z.string().trim().min(1).max(500),

  schema: formSchemaObject,

  settings: z.record(
    z.string(),
    z.unknown()
  ).default({}),

  publishedAt: z.string().nullable().optional(),

  createdAt: z.string().optional()
})

export type Form = z.infer<typeof formSchema>
