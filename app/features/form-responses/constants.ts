export const RESPONSE_FILTER = {
  ALL: 'all',
  SUBMITTED: 'submitted',
  UNSUBMITTED: 'unsubmitted'
} as const

export type ResponseFilter = (typeof RESPONSE_FILTER)[keyof typeof RESPONSE_FILTER]

export const RESPONSE_FILTER_ITEMS = [
  { label: 'Все ответы', value: RESPONSE_FILTER.ALL },
  { label: 'Только отправленные', value: RESPONSE_FILTER.SUBMITTED },
  { label: 'Только черновики', value: RESPONSE_FILTER.UNSUBMITTED }
]
