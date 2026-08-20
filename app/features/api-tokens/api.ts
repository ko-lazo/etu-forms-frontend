import type { ApiToken, CreateApiToken, IssuedApiToken } from './types'
import type { ListQuery, PaginatedResult } from '~/api/types'
import { useHttp } from '~/api/http'

export function useApiTokensApi() {
  const http = useHttp()

  return {
    list(query?: ListQuery) {
      return http.get<PaginatedResult<ApiToken>>('/tokens', { query })
    },

    create(data: CreateApiToken) {
      return http.post<IssuedApiToken>('/tokens', data)
    },

    remove(id: string) {
      return http.delete<undefined>(`/tokens/${id}`)
    }
  }
}
