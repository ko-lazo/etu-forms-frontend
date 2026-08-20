import type { operations } from '~/api/schema'
import type { FormResponse, FormResponseSave } from './types'
import { createCrudApi } from '~/api/crud'
import { useHttp } from '~/api/http'

export type FormResponseListQuery = NonNullable<
  operations['listFormResponses']['parameters']['query']
>

export function useFormResponsesApi(formId: string) {
  return createCrudApi<FormResponse, FormResponseSave, FormResponseListQuery>(
    useHttp(),
    `/forms/${formId}/responses`
  )
}
