import type { FormResponse, FormResponseSave } from '~/types/form/response'
import { createCrudApi } from '~/api/crud.ts'
import { useHttp } from '~/api/http.ts'

export function useFormResponsesApi(formId: string) {
  return createCrudApi<FormResponse, FormResponseSave>(useHttp(), `/forms/${formId}/responses`)
}
