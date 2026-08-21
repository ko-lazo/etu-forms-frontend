import { ApiError, type ApiErrorResponse } from '~/api/error'
import { applyQuery } from '~/api/query'
import { authToken } from '~/features/auth/token'

export function useApi() {
  const config = useRuntimeConfig()

  return $fetch.create({
    baseURL: config.public.apiBaseUrl,

    onRequest(context) {
      applyQuery(context)

      if (!authToken.value) {
        return
      }

      const headers = new Headers(context.options.headers)

      headers.set(
        'Authorization',
        `Bearer ${authToken.value}`
      )

      context.options.headers = headers
    },

    onResponseError({ response }) {
      const body = response._data as ApiErrorResponse | undefined

      throw new ApiError(
        response.status,
        typeof body?.message === 'string'
          ? body
          : { message: 'Произошла ошибка при выполнении запроса' }
      )
    }
  })
}
