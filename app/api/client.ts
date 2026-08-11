import {
  ApiError,
  type ApiErrorResponse
} from './error'
import { authToken } from '~/store/auth.ts'

export function useApi() {
  const config = useRuntimeConfig()

  return $fetch.create({
    baseURL: config.public.apiBaseUrl,

    onRequest({ options }) {
      if (!authToken.value) {
        return
      }

      const headers = new Headers(options.headers)

      headers.set(
        'Authorization',
        `Bearer ${authToken.value}`
      )

      options.headers = headers
    },

    onResponseError({ response }) {
      const body = response._data as ApiErrorResponse | undefined

      throw new ApiError(
        response.status,
        body ?? {
          message: 'Произошла ошибка при выполнении запроса'
        }
      )
    }
  })
}
