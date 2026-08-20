import type { operations } from '~/api/schema'
import type { Form, FormSave } from './types'
import { createCrudApi } from '~/api/crud'
import { useHttp } from '~/api/http'

export type FormListQuery = NonNullable<operations['listForms']['parameters']['query']>

export function useFormsApi() {
  return createCrudApi<Form, FormSave, FormListQuery>(useHttp(), '/forms')
}
