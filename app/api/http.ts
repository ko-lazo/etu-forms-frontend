import type { NitroFetchOptions } from 'nitropack'
import { useApi } from '~/api/client.ts'

type FetchBodyType = NitroFetchOptions<string>['body']

export interface HttpClient {
  get<TResponse>(url: string): Promise<TResponse>

  post<TResponse, TBody extends FetchBodyType = Record<string, unknown>>(
    url: string,
    body?: TBody
  ): Promise<TResponse>

  patch<TResponse, TBody extends FetchBodyType = Record<string, unknown>>(
    url: string,
    body?: TBody
  ): Promise<TResponse>

  delete<TResponse>(url: string): Promise<TResponse>
}

export function useHttp(): HttpClient {
  const api = useApi()

  return {
    get<TResponse>(url: string) {
      return api<TResponse>(url)
    },

    post<TResponse, TBody extends FetchBodyType>(url: string, body?: TBody) {
      return api<TResponse>(url, {
        method: 'POST',
        body
      })
    },

    patch<TResponse, TBody extends FetchBodyType>(url: string, body?: TBody) {
      return api<TResponse>(url, {
        method: 'PATCH',
        body
      })
    },

    delete<TResponse>(url: string) {
      return api<TResponse>(url, {
        method: 'DELETE'
      })
    }
  }
}
