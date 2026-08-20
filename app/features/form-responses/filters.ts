import type { FormResponseListQuery } from './api'
import { RESPONSE_STATUS_FILTER, SUBMITTED_BY_STATUS, type ResponseStatusFilter } from './constants'

type AnswerQuery = NonNullable<FormResponseListQuery['answer']>

export interface AnswerFilter {
  name: string
  value: AnswerQuery[string]
}

export interface ResponseFilters {
  status: ResponseStatusFilter
  submittedFrom: string
  submittedTo: string
  answered: string[]
  answers: AnswerFilter[]
}

export function createResponseFilters(): ResponseFilters {
  return {
    status: RESPONSE_STATUS_FILTER.ALL,
    submittedFrom: '',
    submittedTo: '',
    answered: [],
    answers: []
  }
}

export function toResponseListQuery(filters: ResponseFilters): FormResponseListQuery {
  return {
    submitted: SUBMITTED_BY_STATUS[filters.status],
    submittedFrom: toDayStart(filters.submittedFrom),
    submittedTo: toDayEnd(filters.submittedTo),
    answered: filters.answered.length ? [...filters.answered] : undefined,
    answer: toAnswerQuery(filters.answers)
  }
}

function toAnswerQuery(answers: AnswerFilter[]): FormResponseListQuery['answer'] {
  const query: AnswerQuery = {}

  for (const { name, value } of answers) {
    if (name && value) {
      query[name] = value
    }
  }

  return Object.keys(query).length ? query : undefined
}
