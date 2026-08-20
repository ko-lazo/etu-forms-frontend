import type { MaybeRefOrGetter } from 'vue'
import type { FormPage, FormSchema } from '../schema/form-schema'
import type { FormInput, FormInputValue } from './input'
import type { FormInputStorage } from './input-storage'
import { InputRejectedError } from './input-storage'
import { evaluateCondition } from './evaluate-condition'
import { validateRequiredFields } from './validate-input'

interface UseFormRuntimeOptions {
  schema: MaybeRefOrGetter<FormSchema | null | undefined>
  storage?: FormInputStorage
}

export function useFormRuntime(options: UseFormRuntimeOptions) {
  const { storage } = options

  const input = ref<FormInput>({})
  const errors = ref<Record<string, string>>({})
  const submitted = ref(false)
  const submitting = ref(false)

  const visiblePages = computed<FormPage[]>(() => {
    const schema = toValue(options.schema)
    if (!schema) return []

    return schema.pages
      .filter(page => evaluateCondition(page.visibleIf, input.value))
      .map(page => ({
        ...page,
        elements: page.elements.filter(element => evaluateCondition(element.visibleIf, input.value))
      }))
  })

  function setValue(name: string, value: unknown) {
    input.value[name] = value as FormInputValue

    refreshShownErrors()
    storage?.save?.({ ...input.value })
  }

  function refreshShownErrors() {
    const shown = Object.keys(errors.value)
    if (shown.length === 0) return

    const actual = validateRequiredFields(visiblePages.value, input.value)
    const next: Record<string, string> = {}

    for (const field of shown) {
      const message = actual[field]
      if (message !== undefined) next[field] = message
    }

    errors.value = next
  }

  async function restore() {
    const snapshot = await storage?.load?.()
    if (!snapshot) return

    input.value = { ...input.value, ...snapshot.input }
    submitted.value = snapshot.submitted
  }

  async function submit(): Promise<boolean> {
    errors.value = validateRequiredFields(visiblePages.value, input.value)

    if (Object.keys(errors.value).length > 0) return false

    submitting.value = true
    try {
      await storage?.submit({ ...input.value })
      submitted.value = true
      return true
    } catch (error) {
      if (!(error instanceof InputRejectedError)) throw error

      errors.value = error.fieldErrors
      return false
    } finally {
      submitting.value = false
    }
  }

  function reset() {
    input.value = {}
    errors.value = {}
    submitted.value = false
    submitting.value = false
  }

  onMounted(restore)

  return {
    input,
    errors,
    submitted,
    submitting,
    visiblePages,
    setValue,
    submit,
    reset
  }
}
