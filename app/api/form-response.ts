import type { FormResponse, FormResponseSave } from '~/types/form/response'
import { createCrudApi } from '~/api/crud'
import { useHttp } from '~/api/http'

export function useFormResponsesApi(formId: string) {
  return createCrudApi<FormResponse, FormResponseSave>(useHttp(), `/forms/${formId}/responses`)
}
