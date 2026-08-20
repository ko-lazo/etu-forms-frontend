<script setup lang="ts">
import type { FormElement } from '~/features/forms/schema/form-schema'
import type { AnswerFilter, ResponseFilters } from '~/features/form-responses/filters'
import { RESPONSE_STATUS_FILTER_ITEMS } from '~/features/form-responses/constants'

const props = defineProps<{
  fields: FormElement[]
  active: boolean
}>()

defineEmits<{
  reset: []
}>()

const filters = defineModel<ResponseFilters>({ required: true })

const fieldItems = computed(() => props.fields.map(field => ({
  label: field.label,
  value: field.name
})))

const canAddAnswerFilter = computed(() => filters.value.answers.length < props.fields.length)

function fieldItemsFor(row: AnswerFilter) {
  const taken = new Set(filters.value.answers.map(answer => answer.name))
  taken.delete(row.name)

  return fieldItems.value.filter(item => !taken.has(item.value))
}

function addAnswerFilter() {
  filters.value.answers.push({ name: '', value: '' })
}

function removeAnswerFilter(index: number) {
  filters.value.answers.splice(index, 1)
}
</script>

<template>
  <UCard :ui="{ body: 'flex flex-col gap-5' }">
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <UFormField label="Статус">
        <USelect
          v-model="filters.status"
          class="w-full"
          :items="RESPONSE_STATUS_FILTER_ITEMS"
        />
      </UFormField>

      <UFormField label="Отправлены с">
        <UInput
          v-model="filters.submittedFrom"
          class="w-full"
          type="date"
          :max="filters.submittedTo || undefined"
        />
      </UFormField>

      <UFormField label="Отправлены по">
        <UInput
          v-model="filters.submittedTo"
          class="w-full"
          type="date"
          :min="filters.submittedFrom || undefined"
        />
      </UFormField>

      <UFormField
        label="Заполненные поля"
        help="Ответ содержит все выбранные"
      >
        <USelectMenu
          v-model="filters.answered"
          class="w-full"
          multiple
          value-key="value"
          placeholder="Любые"
          :items="fieldItems"
        />
      </UFormField>
    </div>

    <div class="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-3">
      <div class="flex items-center justify-between gap-3">
        <p class="text-sm font-medium">
          Поиск по ответам
        </p>

        <UButton
          icon="i-lucide-plus"
          size="xs"
          color="neutral"
          variant="ghost"
          :disabled="!canAddAnswerFilter"
          @click="addAnswerFilter"
        >
          Добавить поле
        </UButton>
      </div>

      <p
        v-if="filters.answers.length === 0"
        class="text-sm text-neutral-500"
      >
        Добавьте поле, чтобы отобрать ответы по тому, что в нём написали.
      </p>

      <div
        v-for="(row, index) in filters.answers"
        :key="index"
        class="flex items-center gap-2"
      >
        <USelect
          v-model="row.name"
          class="w-full sm:w-64"
          placeholder="Выберите поле"
          :items="fieldItemsFor(row)"
        />

        <UInput
          v-model.lazy.trim="row.value"
          class="flex-1"
          icon="i-lucide-search"
          placeholder="Содержит..."
          :disabled="!row.name"
        />

        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          aria-label="Убрать поле"
          @click="removeAnswerFilter(index)"
        />
      </div>
    </div>

    <div
      v-if="active"
      class="flex justify-end"
    >
      <UButton
        icon="i-lucide-filter-x"
        size="sm"
        color="neutral"
        variant="subtle"
        @click="$emit('reset')"
      >
        Сбросить фильтры
      </UButton>
    </div>
  </UCard>
</template>
