import type { FormRuntimePersistence } from '~/features/forms/runtime/persistence'
import { AnswersRejectedError } from '~/features/forms/runtime/persistence'
import { useFormResponsesApi } from './api'
import { toFieldErrors } from './error'

const draftStorageKey = (formId: string) => `etu-forms:response:${formId}`

export function useFormResponsePersistence(formId: string) {
  const route = useRoute()
  const router = useRouter()
  const responsesApi = useFormResponsesApi(formId)

  const responseId = ref<string | null>(null)
  const storageKey = draftStorageKey(formId)

  const persistence: FormRuntimePersistence = {
    async loadDraft() {
      const fromQuery = route.query.r as string | undefined
      const existingId = fromQuery ?? localStorage.getItem(storageKey) ?? undefined

      if (!existingId) return null

      try {
        const existing = await responsesApi.get(existingId)
        responseId.value = existing.id
        localStorage.setItem(storageKey, existing.id)

        return { answers: existing.answers, submitted: Boolean(existing.submittedAt) }
      } catch {
        localStorage.removeItem(storageKey)
        return null
      }
    },

    async saveDraft(answers) {
      const saved = await responsesApi.save({
        id: responseId.value ?? undefined,
        answers,
        metadata: {},
        submittedAt: null
      })

      responseId.value = saved.id
      localStorage.setItem(storageKey, saved.id)

      if (!route.query.r) {
        await router.replace({ query: { ...route.query, r: saved.id } })
      }
    },

    async submit(answers) {
      try {
        await responsesApi.save({
          id: responseId.value ?? undefined,
          answers,
          metadata: {},
          submittedAt: new Date().toISOString()
        })
      } catch (error) {
        const fieldErrors = toFieldErrors(error)

        if (Object.keys(fieldErrors).length === 0) throw error

        throw new AnswersRejectedError(fieldErrors)
      }

      localStorage.removeItem(storageKey)
    }
  }

  return { persistence, responseId }
}
