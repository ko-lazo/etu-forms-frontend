import type { HttpClient } from './http'
import type { PaginatedResult } from '~/types/api'

interface CrudEntity {
  id: string
}

export interface ListParams {
  page?: number
  limit?: number
  [key: string]: string | number | boolean | undefined
}

export function toQueryString(params?: ListParams): string {
  if (!params) return ''

  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      query.set(key, String(value))
    }
  }

  const result = query.toString()
  return result ? `?${result}` : ''
}

export function createCrudApi<
  TEntity extends CrudEntity,
  TSave extends Record<string, unknown>
>(
  http: HttpClient,
  resource: string
) {
  return {
    list(params?: ListParams) {
      return http.get<PaginatedResult<TEntity>>(`${resource}${toQueryString(params)}`)
    },

    get(id: string) {
      return http.get<TEntity>(`${resource}/${id}`)
    },

    save(data: TSave & { id?: string }) {
      if (data.id) {
        return http.patch<TEntity, TSave>(`${resource}/${data.id}`, data)
      }

      return http.post<TEntity, TSave>(resource, data)
    },

    remove(id: string) {
      return http.delete<undefined>(`${resource}/${id}`)
    }
  }
}
