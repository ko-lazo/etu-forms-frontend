<script setup lang="ts">
import type { EditorModel } from '~/features/forms/editor/editor-model'
import { useFormRuntime } from '~/features/forms/runtime/useFormRuntime'

const props = defineProps<{
  model: EditorModel
}>()

const {
  answers,
  errors,
  submitted,
  submitting,
  visiblePages,
  setAnswer,
  submit,
  reset
} = useFormRuntime({
  schema: () => props.model.schema
})

const renderer = ref<{ scrollToFirstError: () => void } | null>(null)

async function onSubmit() {
  const sent = await submit()
  if (!sent) renderer.value?.scrollToFirstError()
}

const allPagesHidden = computed(() =>
  props.model.schema.pages.length > 0 && visiblePages.value.length === 0
)
</script>

<template>
  <div class="mx-auto w-full max-w-2xl space-y-4">
    <UAlert
      color="neutral"
      variant="subtle"
      icon="i-lucide-eye"
      title="Предпросмотр"
      description="В режиме предпросмотра ответы не сохраняются и не отправляются."
    >
      <template #actions>
        <UButton
          icon="i-lucide-rotate-ccw"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="reset"
        >
          Начать заново
        </UButton>
      </template>
    </UAlert>

    <FormRuntimeSuccess
      v-if="submitted"
      description="В предпросмотре ответ никуда не отправлен."
    >
      <template #actions>
        <UButton
          icon="i-lucide-rotate-ccw"
          color="neutral"
          variant="subtle"
          @click="reset"
        >
          Заполнить ещё раз
        </UButton>
      </template>
    </FormRuntimeSuccess>

    <UAlert
      v-else-if="allPagesHidden"
      color="warning"
      variant="subtle"
      icon="i-lucide-eye-off"
      title="Все страницы скрыты условиями"
      description="Проверьте условия видимости: при текущих ответах показывать нечего."
    />

    <FormRuntimeRenderer
      v-else
      ref="renderer"
      :title="model.title || 'Форма без названия'"
      :pages="visiblePages"
      :answers="answers"
      :errors="errors"
      :submitting="submitting"
      @update:answer="setAnswer"
      @submit="onSubmit"
    />
  </div>
</template>
