import { z } from 'zod'

const answerSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string())
])

export const formResponseSchema = z.object({
  id: z.uuid(),
  formId: z.uuid(),
  answers: z.record(z.string(), answerSchema),
  metadata: z.record(z.string(), z.unknown()),
  submittedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
})

export const formResponseSaveSchema = z.object({
  answers: z.record(z.string(), answerSchema),
  metadata: z.record(z.string(), z.unknown()).default({}),
  submittedAt: z.string().nullable().optional()
})

export type FormResponse = z.infer<typeof formResponseSchema>
export type FormResponseSave = z.infer<typeof formResponseSaveSchema>
export type FormResponseAnswerValue = z.infer<typeof answerSchema>
