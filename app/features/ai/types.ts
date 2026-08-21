import type { Schemas } from '~/api/types'
import type { FormSchema } from '~/features/forms/schema/form-schema'

export type AiGenerateRequest = Schemas['AiGenerateRequest']

export type AiGenerateResult = Omit<Schemas['AiGenerateResponse'], 'schema'> & {
  schema: FormSchema | null
}

export type AiGenerateStatus = AiGenerateResult['status']

export type AiLimit = Schemas['AiLimit']
