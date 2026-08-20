import type { NitroFetchOptions } from 'nitropack'
import { useApi } from '~/api/client'

type RequestBody = NitroFetchOptions<string>['body']

export type RequestOptions = Pick<
  NitroFetchOptions<string>,
  'query' | 'headers' | 'signal'
>

export interface HttpClient {
  get<TResponse>(url: string, options?: RequestOptions): Promise<TResponse>

  post<TResponse>(url: string, body?: RequestBody, options?: RequestOptions): Promise<TResponse>

  patch<TResponse>(url: string, body?: RequestBody, options?: RequestOptions): Promise<TResponse>

  delete<TResponse>(url: string, options?: RequestOptions): Promise<TResponse>
}

export function useHttp(): HttpClient {
  const api = useApi()

  return {
    get<TResponse>(url: string, options?: RequestOptions) {
      return api<TResponse>(url, options)
    },

    post<TResponse>(url: string, body?: RequestBody, options?: RequestOptions) {
      return api<TResponse>(url, { ...options, method: 'POST', body })
    },

    patch<TResponse>(url: string, body?: RequestBody, options?: RequestOptions) {
      return api<TResponse>(url, { ...options, method: 'PATCH', body })
    },

    delete<TResponse>(url: string, options?: RequestOptions) {
      return api<TResponse>(url, { ...options, method: 'DELETE' })
    }
  }
}
