export interface ApiErrorResponse {
  message: string
  code?: string
  errors?: Record<string, string[]>
}

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly errors?: Record<string, string[]>

  constructor(
    status: number,
    response: ApiErrorResponse
  ) {
    super(response.message)

    this.name = 'ApiError'
    this.status = status
    this.code = response.code
    this.errors = response.errors
  }
}
