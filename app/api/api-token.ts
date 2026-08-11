import type { PaginatedResult } from '~/types/api'
import type { ApiToken, ApiTokenCreated, ApiTokenSave } from '~/types/api-token'
import { useHttp } from '~/api/http.ts'

export function useApiTokensApi() {
  const http = useHttp()

  return {
    list() {
      return http.get<PaginatedResult<ApiToken>>('/tokens')
    },

    create(data: ApiTokenSave) {
      return http.post<ApiTokenCreated>('/tokens', data)
    },

    remove(id: string) {
      return http.delete<undefined>(`/tokens/${id}`)
    }
  }
}
