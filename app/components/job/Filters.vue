<script setup lang="ts">
import type { JobFilters } from '~/features/jobs/filters'
import { JOB_STATUS_FILTER_ITEMS } from '~/features/jobs/constants'

defineProps<{
  active: boolean
}>()

defineEmits<{
  reset: []
}>()

const filters = defineModel<JobFilters>({ required: true })
</script>

<template>
  <UCard :ui="{ body: 'flex flex-col gap-5' }">
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <UFormField label="Статус">
        <USelect
          v-model="filters.status"
          class="w-full"
          :items="JOB_STATUS_FILTER_ITEMS"
        />
      </UFormField>

      <UFormField label="Созданы с">
        <UInput
          v-model="filters.createdFrom"
          class="w-full"
          type="date"
          :max="filters.createdTo || undefined"
        />
      </UFormField>

      <UFormField label="Созданы по">
        <UInput
          v-model="filters.createdTo"
          class="w-full"
          type="date"
          :min="filters.createdFrom || undefined"
        />
      </UFormField>
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
