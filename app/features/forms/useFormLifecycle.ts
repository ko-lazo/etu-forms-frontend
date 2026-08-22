import type { Form } from './types'
import type { FormTransition } from './constants'
import { useFormsApi } from './api'
import { FORM_TRANSITION_META } from './constants'
import { toLifecycleErrorMessage } from './error'

export function useFormLifecycle(formId: string) {
  const api = useFormsApi()
  const toast = useToast()

  const pendingTransition = ref<FormTransition | null>(null)

  async function runTransition(transition: FormTransition): Promise<Form | null> {
    pendingTransition.value = transition

    try {
      const form = await api[transition](formId)

      toast.add({ title: FORM_TRANSITION_META[transition].success, color: 'success' })

      return form
    } catch (error) {
      toast.add({ title: toLifecycleErrorMessage(error), color: 'error' })

      return null
    } finally {
      pendingTransition.value = null
    }
  }

  return {
    pendingTransition,
    runTransition
  }
}
