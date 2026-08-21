import type { AiGenerateStatus } from './types'

export const AI_STATUS = {
  OK: 'ok',
  UNSUPPORTED: 'unsupported',
  AMBIGUOUS: 'ambiguous'
} as const satisfies Record<string, AiGenerateStatus>

export const AI_MESSAGE_ROLE = {
  USER: 'user',
  ASSISTANT: 'assistant'
} as const

export type AiMessageRole = (typeof AI_MESSAGE_ROLE)[keyof typeof AI_MESSAGE_ROLE]

export const AI_PROMPT_MAX_LENGTH = 5000

export const AI_PROMPT_EXAMPLES = [
  'Анкета участника конференции: имя, email, выбор тематики, согласие на рассылку',
  'Заявка в поддержку: тема, описание проблемы, срочность и контакт для ответа',
  'Опрос после мероприятия: оценка от 1 до 10, что понравилось, что улучшить'
]
