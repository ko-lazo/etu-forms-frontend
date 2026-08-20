import type { HttpClient } from './http'
import type { ListQuery, PaginatedResult } from './types'

interface CrudEntity {
  id: string
}

export function createCrudApi<
  TEntity extends CrudEntity,
  TSave extends Record<string, unknown>,
  TQuery extends ListQuery = ListQuery
>(
  http: HttpClient,
  resource: string
) {
  return {
    list(query?: TQuery) {
      return http.get<PaginatedResult<TEntity>>(resource, { query })
    },

    get(id: string) {
      return http.get<TEntity>(`${resource}/${id}`)
    },

    save(data: TSave & { id?: string }) {
      if (data.id) {
        return http.patch<TEntity>(`${resource}/${data.id}`, data)
      }

      return http.post<TEntity>(resource, data)
    },

    remove(id: string) {
      return http.delete<undefined>(`${resource}/${id}`)
    }
  }
}
