<script setup lang="ts">
import { useFormsApi } from '~/api/form.ts'

definePageMeta({ layout: 'default' })

const route = useRoute()
const formId = route.params.id as string

const formsApi = useFormsApi()

const { data: form, status, error } = await useAsyncData(`public-form-${formId}`, () => formsApi.get(formId))

const { persistence, responseId } = useFormResponsePersistence(formId)

const {
  answers,
  errors,
  submitted,
  submitting,
  saveState,
  visiblePages,
  setAnswer,
  submit
} = useFormRuntime({
  schema: () => form.value?.schema,
  persistence
})

const resumeUrl = computed(() => {
  if (!responseId.value || import.meta.server) return ''
  return `${window.location.origin}${route.path}?r=${responseId.value}`
})

const copied = ref(false)

async function copyResumeUrl() {
  if (!resumeUrl.value) return
  await navigator.clipboard.writeText(resumeUrl.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <div class="min-h-screen bg-elevated/30">
    <UContainer class="max-w-2xl py-10">
      <div
        v-if="status === 'pending'"
        class="space-y-4"
      >
        <USkeleton class="h-24 w-full" />
        <USkeleton class="h-40 w-full" />
      </div>

      <UAlert
        v-else-if="error"
        color="error"
        variant="subtle"
        icon="i-lucide-alert-triangle"
        title="Форма не найдена"
        description="Проверьте ссылку или обратитесь к тому, кто её отправил."
      />

      <FormRuntimeSuccess v-else-if="submitted" />

      <FormRuntimeRenderer
        v-else-if="form"
        :title="form.title"
        :pages="visiblePages"
        :answers="answers"
        :errors="errors"
        :submitting="submitting"
        @update:answer="setAnswer"
        @submit="submit"
      >
        <template
          v-if="resumeUrl"
          #before
        >
          <div class="mt-4 flex items-center justify-between gap-3 rounded-lg border border-dashed border-default bg-default p-3 text-sm">
            <div class="flex items-center gap-2 text-muted">
              <UIcon
                name="i-lucide-link"
                class="size-4 shrink-0"
              />
              <span>Эта ссылка сохранит ваш прогресс - можно вернуться и продолжить позже</span>
            </div>
            <UButton
              :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
              color="neutral"
              variant="subtle"
              size="sm"
              @click="copyResumeUrl"
            >
              {{ copied ? 'Скопировано' : 'Копировать' }}
            </UButton>
          </div>
        </template>

        <template #status>
          <template v-if="saveState === 'saving'">
            Сохранение...
          </template>
          <template v-else-if="saveState === 'saved'">
            Черновик сохранён
          </template>
        </template>
      </FormRuntimeRenderer>
    </UContainer>
  </div>
</template>
