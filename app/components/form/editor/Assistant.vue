<script setup lang="ts">
import type { FormSchema } from '~/features/forms/schema/form-schema'
import type { AiMessage } from '~/features/ai/useAiConstructor'
import { AI_PROMPT_EXAMPLES, AI_PROMPT_MAX_LENGTH } from '~/features/ai/constants'
import { useAiConstructor } from '~/features/ai/useAiConstructor'

const props = defineProps<{
  formId?: string
  dirty?: boolean
}>()

const emit = defineEmits<{
  apply: [schema: FormSchema]
  preview: []
}>()

const {
  messages,
  prompt,
  generating,
  limit,
  limitStatus,
  limitError,
  limitReached,
  canSend,
  send,
  refreshLimit
} = useAiConstructor({
  formId: () => props.formId,
  apply: schema => emit('apply', schema)
})

const REQUESTS: [string, string, string] = ['запрос', 'запроса', 'запросов']

const FAILED_MESSAGE = {
  icon: 'i-lucide-triangle-alert',
  color: 'error',
  variant: 'soft'
} as const

const chatMessages = computed(() => messages.value.map(message => ({
  id: message.id,
  role: message.role,
  parts: [{ type: 'text' as const, text: message.text }],
  metadata: message,
  ...(message.failed ? FAILED_MESSAGE : {})
})))

function aiMessage(metadata: unknown): AiMessage {
  return metadata as AiMessage
}
</script>

<template>
  <div class="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-default pb-3">
      <div class="flex items-center gap-2">
        <UIcon
          name="i-lucide-sparkles"
          class="size-5 text-primary"
        />
        <span class="font-semibold text-highlighted">ИИ-конструктор</span>
        <UBadge
          label="бета"
          color="primary"
          variant="subtle"
          size="sm"
        />
      </div>

      <USkeleton
        v-if="limitStatus === 'pending'"
        class="h-5 w-44"
      />

      <UButton
        v-else-if="limitError"
        icon="i-lucide-rotate-ccw"
        color="error"
        variant="ghost"
        size="xs"
        @click="refreshLimit()"
      >
        Не удалось обновить остаток запросов
      </UButton>

      <UTooltip
        v-else-if="limit"
        :text="`Счётчик обнулится ${formatDateTime(limit.resetAt)}`"
      >
        <span
          class="text-sm"
          :class="limitReached ? 'text-error' : 'text-muted'"
        >
          Осталось <span class="font-semibold">{{ limit.remaining }}</span>
          из {{ limit.limit }} {{ pluralize(limit.limit, REQUESTS) }} на сегодня
        </span>
      </UTooltip>
    </div>

    <UAlert
      v-if="limit && limitReached"
      color="warning"
      variant="subtle"
      icon="i-lucide-hourglass"
      title="Суточный лимит исчерпан"
      :description="`Новые запросы станут доступны ${formatDateTime(limit.resetAt)}.`"
    />

    <UAlert
      v-if="!formId"
      color="info"
      variant="subtle"
      icon="i-lucide-save"
      title="Сначала сохраните форму"
      description="ИИ дорабатывает сохранённую схему, поэтому у новой формы вкладка доступна только после первого сохранения"
    />

    <UAlert
      v-else-if="dirty"
      color="warning"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      title="Есть несохранённые изменения"
      description="ИИ читает форму с сервера: и ваши правки, и уже применённый ответ он учтёт только после сохранения"
    />

    <div class="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <AppEmptyState
        v-if="messages.length === 0"
        class="m-auto"
        icon="i-lucide-message-square-quote"
        title="Расскажите, какая форма вам нужна"
        description="Напишите задачу обычными словами. ИИ сам создаст нужные страницы и поля, а вам останется лишь проверить результат. Вы также можете просить его доработать или исправить уже готовую форму - ничего не удалится."
      >
        <div class="flex flex-col items-stretch gap-2 pt-2">
          <UButton
            v-for="example in AI_PROMPT_EXAMPLES"
            :key="example"
            color="neutral"
            variant="subtle"
            size="sm"
            class="text-left"
            :disabled="!formId"
            @click="prompt = example"
          >
            {{ example }}
          </UButton>
        </div>
      </AppEmptyState>

      <UChatMessages
        v-else
        :messages="chatMessages"
        :status="generating ? 'submitted' : 'ready'"
        :ui="{ root: 'px-0' }"
      >
        <template #content="{ metadata }">
          <p class="whitespace-pre-wrap">
            {{ aiMessage(metadata).text }}
          </p>

          <div
            v-if="aiMessage(metadata).applied"
            class="mt-2 flex flex-wrap items-center gap-2"
          >
            <UButton
              icon="i-lucide-eye"
              color="neutral"
              variant="link"
              size="xs"
              class="p-0"
              @click="emit('preview')"
            >
              Посмотреть
            </UButton>
          </div>
        </template>
      </UChatMessages>
    </div>

    <UChatPrompt
      v-model="prompt"
      variant="subtle"
      placeholder="Например: добавь страницу с контактами - телефон и удобное время для звонка"
      :autofocus="false"
      :maxrows="8"
      :maxlength="AI_PROMPT_MAX_LENGTH"
      :disabled="!formId || limitReached"
      class="shrink-0"
      @submit="send"
    >
      <template #footer>
        <p class="text-xs text-dimmed">
          {{ generating ? 'Ответ может занять некоторое время...' : 'Enter - отправить, Shift + Enter - перенос строки' }}
        </p>

        <UChatPromptSubmit
          icon="i-lucide-sparkles"
          aria-label="Сгенерировать"
          :loading="generating"
          :disabled="!canSend"
        />
      </template>
    </UChatPrompt>
  </div>
</template>
