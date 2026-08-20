import type { components } from './schema'

export type Schemas = components['schemas']

export interface PaginatedResult<TEntity> {
  data: TEntity[]
  meta: Schemas['PaginationMeta']
}

export interface ListQuery {
  page?: number
  limit?: number
}
