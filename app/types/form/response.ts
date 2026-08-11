export type FormResponseAnswerValue = string | number | boolean | string[]

export interface FormResponse {
  id: string
  formId: string
  answers: Record<string, FormResponseAnswerValue>
  metadata: Record<string, unknown>
  submittedAt: string | null
  createdAt: string
  updatedAt: string
}
