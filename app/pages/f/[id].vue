<script setup lang="ts">
import { useFormsApi } from '~/features/forms/api'
import { useFormResponseStorage } from '~/features/form-responses/useFormResponseStorage'
import { useFormRuntime } from '~/features/forms/runtime/useFormRuntime'

definePageMeta({ layout: 'default' })

const route = useRoute()
const formId = route.params.id as string

const formsApi = useFormsApi()

const { data: form, status, error } = await useAsyncData(`public-form-${formId}`, () => formsApi.get(formId))

const { storage, responseId, saving, saved } = useFormResponseStorage(formId)

const {
  input,
  errors,
  submitted,
  submitting,
  visiblePages,
  setValue,
  submit
} = useFormRuntime({
  schema: () => form.value?.schema,
  storage
})

const renderer = ref<{ scrollToFirstError: () => void } | null>(null)

async function onSubmit() {
  const sent = await submit()
  if (!sent) renderer.value?.scrollToFirstError()
}

const resumeUrl = computed(() => {
  if (!responseId.value || import.meta.server) return ''
  return `${window.location.origin}${route.path}?r=${responseId.value}`
})

const { copied, copy } = useCopyToClipboard()
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

      <AppErrorState
        v-else-if="error"
        title="Форма не найдена"
        description="Проверьте ссылку или обратитесь к тому, кто её отправил."
      />

      <FormRuntimeSuccess v-else-if="submitted" />

      <FormRuntimeRenderer
        v-else-if="form"
        ref="renderer"
        :title="form.title"
        :pages="visiblePages"
        :input="input"
        :errors="errors"
        :submitting="submitting"
        @update:value="setValue"
        @submit="onSubmit"
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
              @click="copy(resumeUrl)"
            >
              {{ copied ? 'Скопировано' : 'Копировать' }}
            </UButton>
          </div>
        </template>

        <template #status>
          <template v-if="saving">
            Сохранение...
          </template>
          <template v-else-if="saved">
            Черновик сохранён
          </template>
        </template>
      </FormRuntimeRenderer>
    </UContainer>
  </div>
</template>
