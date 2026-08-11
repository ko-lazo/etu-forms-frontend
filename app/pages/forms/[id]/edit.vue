<script setup lang="ts">
import { useFormsApi } from '~/api/form.ts'

definePageMeta({ layout: 'dashboard', middleware: 'auth', title: 'Формы: редактирование' })

const route = useRoute()
const formId = route.params.id as string

const formsApi = useFormsApi()
const toast = useToast()
const saving = ref(false)

const { setBreadcrumbs } = usePageHeader()
setBreadcrumbs([{ label: 'Формы', to: '/forms' }, { label: 'Загрузка...' }])

const { data: form, status, error } = await useAsyncData(
  `form-${formId}`,
  () => formsApi.get(formId)
)

const model = ref(form.value ? formToEditorModel(form.value) : null)

watch(form, (value) => {
  if (value && !model.value) {
    model.value = formToEditorModel(value)
  }
})

async function save() {
  if (!model.value) return

  saving.value = true
  try {
    await formsApi.save(model.value)
    toast.add({ title: 'Изменения сохранены', color: 'success' })
  } catch {
    toast.add({ title: 'Не удалось сохранить форму', color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UContainer class="max-w-3xl py-8">
    <div
      v-if="status === 'pending'"
      class="space-y-4"
    >
      <USkeleton class="h-10 w-full" />
      <USkeleton class="h-40 w-full" />
    </div>

    <UAlert
      v-else-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-alert-triangle"
      title="Не удалось загрузить форму"
      :description="error.message"
    />

    <FormBuilderMain
      v-else-if="model"
      v-model="model"
      :saving="saving"
      @submit="save"
    />
  </UContainer>
</template>
