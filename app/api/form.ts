import type { Form } from '~/types/form/form'
import type { FormEditorModel } from '~/types/form/editor'
import { createCrudApi } from '~/api/crud'
import { useHttp } from '~/api/http'

export function useFormsApi() {
  return createCrudApi<Form, FormEditorModel>(useHttp(), '/forms')
}
