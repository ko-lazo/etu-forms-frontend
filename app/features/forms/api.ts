import type { operations } from '~/api/schema'
import type { Form, FormSave } from './types'
import { createCrudApi } from '~/api/crud'
import { useHttp } from '~/api/http'

export type FormListQuery = NonNullable<operations['listForms']['parameters']['query']>

export function useFormsApi() {
  const http = useHttp()

  const crud = createCrudApi<Form, FormSave, FormListQuery>(http, '/forms')

  return {
    ...crud,

    publish(id: string) {
      return http.post<Form>(`/forms/${id}/publish`)
    },

    unpublish(id: string) {
      return http.post<Form>(`/forms/${id}/unpublish`)
    },

    archive(id: string) {
      return http.post<Form>(`/forms/${id}/archive`)
    },

    unarchive(id: string) {
      return http.post<Form>(`/forms/${id}/unarchive`)
    }
  }
}
