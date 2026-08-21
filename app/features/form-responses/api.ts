import type { operations } from '~/api/schema'
import type { Job } from '~/features/jobs/types'
import type { FormResponse, FormResponseSave } from './types'
import { createCrudApi } from '~/api/crud'
import { useHttp } from '~/api/http'

export type FormResponseListQuery = NonNullable<
  operations['listFormResponses']['parameters']['query']
>

export function useFormResponsesApi(formId: string) {
  const http = useHttp()

  const crud = createCrudApi<FormResponse, FormResponseSave, FormResponseListQuery>(
    http,
    `/forms/${formId}/responses`
  )

  return {
    ...crud,

    startExport() {
      return http.post<Job>(`/forms/${formId}/export`)
    }
  }
}
