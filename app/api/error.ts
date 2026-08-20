import type { Schemas } from './types'

export interface ApiErrorResponse {
  message: string
  code?: Schemas['DomainError']['code']
  details?: unknown
}

export class ApiError extends Error {
  readonly status: number
  readonly code?: Schemas['DomainError']['code']
  readonly details?: unknown

  constructor(
    status: number,
    response: ApiErrorResponse
  ) {
    super(response.message)

    this.name = 'ApiError'
    this.status = status
    this.code = response.code
    this.details = response.details
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
