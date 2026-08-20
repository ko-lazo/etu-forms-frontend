<script setup lang="ts">
import type { FormElement } from '~/features/forms/schema/form-schema'
import type { FormResponse } from '~/features/form-responses/types'

const open = defineModel<boolean>('open', { required: true })

defineProps<{
  response: FormResponse | null
  fields: FormElement[]
}>()

function formatValue(value: unknown): string {
  if (value === undefined || value === null || value === '') return EMPTY_VALUE
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет'
  return String(value)
}
</script>

<template>
  <USlideover
    v-model:open="open"
    title="Детали ответа"
    description="Полный список заполненных полей пользователя"
  >
    <template #body>
      <div
        v-if="response"
        class="space-y-6"
      >
        <div class="bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg text-xs text-neutral-500 space-y-1">
          <p><strong>ID ответа:</strong> {{ response.id }}</p>
          <p><strong>Отправлено:</strong> {{ formatDateTime(response.submittedAt) }}</p>
        </div>

        <div class="space-y-4 divide-y divide-neutral-100 dark:divide-neutral-800">
          <div
            v-for="field in fields"
            :key="field.name"
            class="pt-3 first:pt-0"
          >
            <p class="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              {{ field.label }}
            </p>
            <p class="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100 break-words">
              {{ formatValue(response.answers[field.name]) }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>
