import type { FormResponseListQuery } from './api'

export const RESPONSE_STATUS_FILTER = {
  ALL: 'all',
  SUBMITTED: 'submitted',
  UNSUBMITTED: 'unsubmitted'
} as const

export type ResponseStatusFilter = (typeof RESPONSE_STATUS_FILTER)[keyof typeof RESPONSE_STATUS_FILTER]

export const RESPONSE_STATUS_FILTER_ITEMS = [
  { label: 'Все ответы', value: RESPONSE_STATUS_FILTER.ALL },
  { label: 'Только отправленные', value: RESPONSE_STATUS_FILTER.SUBMITTED },
  { label: 'Только незавершённые', value: RESPONSE_STATUS_FILTER.UNSUBMITTED }
]

export const SUBMITTED_BY_STATUS: Record<ResponseStatusFilter, FormResponseListQuery['submitted']> = {
  [RESPONSE_STATUS_FILTER.ALL]: undefined,
  [RESPONSE_STATUS_FILTER.SUBMITTED]: true,
  [RESPONSE_STATUS_FILTER.UNSUBMITTED]: false
}
