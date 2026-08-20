import type { FormInput } from '~/features/forms/runtime/input'
import type { FormInputStorage } from '~/features/forms/runtime/input-storage'
import { InputRejectedError } from '~/features/forms/runtime/input-storage'
import { useFormResponsesApi } from './api'
import { toFieldErrors } from './error'

const AUTOSAVE_DELAY = 800

const storageKeyFor = (formId: string) => `etu-forms:response:${formId}`

/**
 * Пока ответ не отправлен, он считается черновиком, и к его
 * заполнению пользователь может вернуться позже
 */
export function useFormResponseStorage(formId: string) {
  const route = useRoute()
  const router = useRouter()
  const responsesApi = useFormResponsesApi(formId)

  const responseId = ref<string | null>(null)
  const saving = ref(false)
  const saved = ref(false)
  const storageKey = storageKeyFor(formId)

  let saveTimeout: ReturnType<typeof setTimeout> | undefined

  function saveToLocalStorage(id: string) {
    responseId.value = id
    localStorage.setItem(storageKey, id)
  }

  async function saveDraft(input: FormInput) {
    const response = await responsesApi.save({
      id: responseId.value ?? undefined,
      answers: input,
      metadata: {},
      submittedAt: null
    })

    saveToLocalStorage(response.id)

    if (!route.query.r) {
      await router.replace({ query: { ...route.query, r: response.id } })
    }
  }

  const storage: FormInputStorage = {
    async load() {
      const existingId = (route.query.r as string | undefined)
        ?? localStorage.getItem(storageKey)
        ?? undefined

      if (!existingId) return null

      try {
        const existing = await responsesApi.get(existingId)
        saveToLocalStorage(existing.id)

        return { input: existing.answers, submitted: Boolean(existing.submittedAt) }
      } catch {
        localStorage.removeItem(storageKey)
        return null
      }
    },

    save(input) {
      saving.value = true
      saved.value = false

      clearTimeout(saveTimeout)
      saveTimeout = setTimeout(async () => {
        try {
          await saveDraft(input)
          saved.value = true
        } finally {
          saving.value = false
        }
      }, AUTOSAVE_DELAY)
    },

    async submit(input) {
      clearTimeout(saveTimeout)

      try {
        await responsesApi.save({
          id: responseId.value ?? undefined,
          answers: input,
          metadata: {},
          submittedAt: new Date().toISOString()
        })
      } catch (error) {
        const fieldErrors = toFieldErrors(error)

        if (Object.keys(fieldErrors).length === 0) throw error

        throw new InputRejectedError(fieldErrors)
      }

      localStorage.removeItem(storageKey)
    }
  }

  onUnmounted(() => clearTimeout(saveTimeout))

  return { storage, responseId, saving, saved }
}
