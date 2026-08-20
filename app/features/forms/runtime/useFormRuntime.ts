import type { MaybeRefOrGetter } from 'vue'
import type { FormPage, FormSchema } from '../schema/form-schema'
import type { FormAnswers, FormAnswerValue } from './answers'
import type { FormRuntimePersistence } from './persistence'
import { AnswersRejectedError } from './persistence'
import { evaluateCondition } from './evaluate-condition'
import { validateRequiredAnswers } from './validate-answers'

const AUTOSAVE_DELAY = 800

export type FormRuntimeSaveState = 'idle' | 'saving' | 'saved'

interface UseFormRuntimeOptions {
  schema: MaybeRefOrGetter<FormSchema | null | undefined>
  persistence?: FormRuntimePersistence
  autosaveDelay?: number
}

export function useFormRuntime(options: UseFormRuntimeOptions) {
  const { persistence } = options

  const answers = ref<FormAnswers>({})
  const errors = ref<Record<string, string>>({})
  const submitted = ref(false)
  const submitting = ref(false)
  const saveState = ref<FormRuntimeSaveState>('idle')

  const visiblePages = computed<FormPage[]>(() => {
    const schema = toValue(options.schema)
    if (!schema) return []

    return schema.pages
      .filter(page => evaluateCondition(page.visibleIf, answers.value))
      .map(page => ({
        ...page,
        elements: page.elements.filter(element => evaluateCondition(element.visibleIf, answers.value))
      }))
  })

  let saveTimeout: ReturnType<typeof setTimeout> | undefined

  function scheduleSave() {
    if (!persistence?.saveDraft) return

    saveState.value = 'saving'
    clearTimeout(saveTimeout)
    saveTimeout = setTimeout(saveDraft, options.autosaveDelay ?? AUTOSAVE_DELAY)
  }

  async function saveDraft() {
    if (!persistence?.saveDraft) return

    try {
      await persistence.saveDraft({ ...answers.value })
      saveState.value = 'saved'
    } catch {
      saveState.value = 'idle'
    }
  }

  function setAnswer(name: string, value: unknown) {
    answers.value[name] = value as FormAnswerValue
    refreshShownErrors()
    scheduleSave()
  }

  function refreshShownErrors() {
    const shown = Object.keys(errors.value)
    if (shown.length === 0) return

    const actual = validateRequiredAnswers(visiblePages.value, answers.value)
    const next: Record<string, string> = {}

    for (const field of shown) {
      const message = actual[field]
      if (message !== undefined) next[field] = message
    }

    errors.value = next
  }

  async function loadDraft() {
    const draft = await persistence?.loadDraft?.()
    if (!draft) return

    answers.value = { ...answers.value, ...draft.answers }
    submitted.value = draft.submitted
  }

  async function submit(): Promise<boolean> {
    errors.value = validateRequiredAnswers(visiblePages.value, answers.value)

    if (Object.keys(errors.value).length > 0) return false

    submitting.value = true
    try {
      await persistence?.submit({ ...answers.value })
      submitted.value = true
      return true
    } catch (error) {
      if (!(error instanceof AnswersRejectedError)) throw error

      errors.value = error.fieldErrors
      return false
    } finally {
      submitting.value = false
    }
  }

  function reset() {
    clearTimeout(saveTimeout)

    answers.value = {}
    errors.value = {}
    submitted.value = false
    submitting.value = false
    saveState.value = 'idle'
  }

  onMounted(loadDraft)
  onUnmounted(() => clearTimeout(saveTimeout))

  return {
    answers,
    errors,
    submitted,
    submitting,
    saveState,
    visiblePages,
    setAnswer,
    submit,
    reset
  }
}
