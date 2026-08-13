<script setup lang="ts">
import { useFormsApi } from '~/api/form.ts'

definePageMeta({ layout: 'builder', middleware: 'auth', title: 'Формы: редактирование' })

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

const formStatus = computed<'draft' | 'published' | 'archived'>(() => {
  if (!form.value) return 'draft'
  if (form.value.archivedAt) return 'archived'
  if (form.value.publishedAt) return 'published'
  return 'draft'
})

watch(form, (value) => {
  if (value && !model.value) {
    model.value = formToEditorModel(value)
  }
  if (value) {
    setBreadcrumbs([{ label: 'Формы', to: '/forms' }, { label: value.title }])
  }
}, { immediate: true })

async function save() {
  if (!model.value) return

  const payload = parseEditorModelToPayload(model.value)

  if (!payload.success) {
    toast.add({
      title: 'Форма заполнена некорректно',
      description: formatValidationError(payload.error),
      color: 'error'
    })
    return
  }

  saving.value = true
  try {
    await formsApi.save(payload.data)
    toast.add({ title: 'Изменения сохранены', color: 'success' })
  } catch {
    toast.add({ title: 'Не удалось сохранить форму', color: 'error' })
  } finally {
    saving.value = false
  }
}

function notImplemented() {
  toast.add({
    title: 'Soon',
    color: 'neutral'
  })
}

const publicUrl = computed(() => {
  if (import.meta.server) return ''
  return `${window.location.origin}/f/${formId}`
})

const copied = ref(false)

async function copyPublicUrl() {
  await navigator.clipboard.writeText(publicUrl.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <UDashboardPanel v-if="status === 'pending'">
    <template #header>
      <AppNavbar />
    </template>

    <template #body>
      <USkeleton class="h-10 w-full" />
      <USkeleton class="h-40 w-full" />
    </template>
  </UDashboardPanel>

  <UDashboardPanel v-else-if="error">
    <template #header>
      <AppNavbar />
    </template>

    <template #body>
      <UAlert
        color="error"
        variant="subtle"
        icon="i-lucide-alert-triangle"
        title="Не удалось загрузить форму"
        :description="error.message"
      />
    </template>
  </UDashboardPanel>

  <FormBuilderMain
    v-else-if="model"
    v-model="model"
    :saving="saving"
    :status="formStatus"
    @submit="save"
    @publish="notImplemented"
    @archive="notImplemented"
  >
    <template #actions>
      <UTooltip :text="publicUrl">
        <UButton
          :icon="copied ? 'i-lucide-check' : 'i-lucide-globe'"
          color="neutral"
          variant="subtle"
          size="sm"
          @click="copyPublicUrl"
        >
          {{ copied ? 'Скопировано' : 'Публичная ссылка' }}
        </UButton>
      </UTooltip>
    </template>
  </FormBuilderMain>
</template>
