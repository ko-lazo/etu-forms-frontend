<script setup lang="ts">
import { useFormsApi } from '~/features/forms/api'
import { createEmptyEditorModel, formatEditorError, parseEditorModel } from '~/features/forms/editor/editor-model'

definePageMeta({ layout: 'builder', middleware: 'auth', title: 'Формы: создание' })

const { setBreadcrumbs } = usePageHeader()
setBreadcrumbs([{ label: 'Формы', to: '/forms' }, { label: 'Новая форма' }])

const formsApi = useFormsApi()
const toast = useToast()
const saving = ref(false)

const model = ref(createEmptyEditorModel())

const { isDirty, markSaved, reset } = useUnsavedChanges(model)

async function save() {
  if (!model.value.title.trim()) {
    toast.add({ title: 'Сначала укажите название формы', color: 'warning' })
    return
  }

  const payload = parseEditorModel(model.value)

  if (!payload.success) {
    toast.add({
      title: 'Форма заполнена некорректно',
      description: formatEditorError(payload.error),
      color: 'error'
    })
    return
  }

  saving.value = true
  try {
    const form = await formsApi.save(payload.data)
    markSaved()
    toast.add({ title: 'Форма создана', color: 'success' })
    await navigateTo(`/forms/${form.id}/edit`)
  } catch {
    toast.add({ title: 'Не удалось создать форму', color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <FormEditor
    v-model="model"
    :saving="saving"
    :dirty="isDirty"
    @submit="save"
    @reset="reset"
  />
</template>
