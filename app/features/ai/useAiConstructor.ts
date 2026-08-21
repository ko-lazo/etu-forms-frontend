import type { MaybeRefOrGetter } from 'vue'
import type { FormSchema } from '~/features/forms/schema/form-schema'
import type { AiMessageRole } from './constants'
import type { AiLimit } from './types'
import { useAiApi } from './api'
import { AI_MESSAGE_ROLE, AI_STATUS } from './constants'
import { toAiErrorMessage } from './error'

export interface AiMessage {
  id: string
  role: AiMessageRole
  text: string
  applied?: boolean
  failed?: boolean
}

interface UseAiConstructorOptions {
  formId: MaybeRefOrGetter<string | undefined>
  apply: (schema: FormSchema) => void
}

export function useAiConstructor(options: UseAiConstructorOptions) {
  const api = useAiApi()

  const messages = ref<AiMessage[]>([])
  const prompt = ref('')
  const generating = ref(false)

  const {
    data: limit,
    status: limitStatus,
    error: limitError,
    refresh: refreshLimit
  } = useAsyncData<AiLimit>('ai-limit', () => api.limit())

  const exhausted = computed(() => Boolean(limit.value && limit.value.remaining <= 0))

  const canSend = computed(() =>
    Boolean(toValue(options.formId))
    && prompt.value.trim().length > 0
    && !generating.value
    && !exhausted.value
  )

  function push(message: Omit<AiMessage, 'id'>) {
    messages.value.push({ id: createUid(), ...message })
  }

  async function send() {
    const formId = toValue(options.formId)
    const text = prompt.value.trim()

    if (!formId || !text || generating.value) return

    push({ role: AI_MESSAGE_ROLE.USER, text })
    prompt.value = ''
    generating.value = true

    try {
      const result = await api.generateFormSchema(formId, text)
      const schema = result.status === AI_STATUS.OK ? result.schema : null

      if (schema) options.apply(schema)

      push({ role: AI_MESSAGE_ROLE.ASSISTANT, text: result.message, applied: Boolean(schema) })
    } catch (error) {
      push({ role: AI_MESSAGE_ROLE.ASSISTANT, text: toAiErrorMessage(error), failed: true })
    } finally {
      generating.value = false
      await refreshLimit()
    }
  }

  return {
    messages,
    prompt,
    generating,
    limit,
    limitStatus,
    limitError,
    exhausted,
    canSend,
    send,
    refreshLimit
  }
}
