import type { Form } from '~/types/form/api'
import type { FormEditorModel } from '~/types/form/editor'
import { createCrudApi } from '~/api/crud.ts'
import { useHttp } from '~/api/http.ts'

export function useFormsApi() {
  return createCrudApi<Form, FormEditorModel>(useHttp(), '/forms')
}
