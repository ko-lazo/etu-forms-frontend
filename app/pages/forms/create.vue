<script setup lang="ts">
import { useFormsApi } from '~/api/form.ts'

definePageMeta({ layout: 'dashboard', middleware: 'auth', title: 'Формы: создание' })

const { setBreadcrumbs } = usePageHeader()
setBreadcrumbs([{ label: 'Формы', to: '/forms' }, { label: 'Новая форма' }])

const formsApi = useFormsApi()
const toast = useToast()
const saving = ref(false)

const model = ref(createEmptyFormEditorModel())

async function save() {
  if (!model.value.title.trim()) {
    toast.add({ title: 'Сначала укажите название формы', color: 'warning' })
    return
  }

  saving.value = true
  try {
    const form = await formsApi.save(model.value)
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
  <UContainer class="max-w-3xl py-8">
    <FormBuilderMain
      v-model="model"
      :saving="saving"
      @submit="save"
    />
  </UContainer>
</template>
