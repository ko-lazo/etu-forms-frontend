<script setup lang="ts">
const title = defineModel<string>({ required: true })

const props = defineProps<{
  saving?: boolean
  status?: 'draft' | 'published' | 'archived'
}>()

const emit = defineEmits<{
  submit: []
  publish: []
  archive: []
}>()

const statusBadge = computed(() => {
  if (props.status === 'published') return { label: 'Опубликована', color: 'success' as const }
  if (props.status === 'archived') return { label: 'В архиве', color: 'warning' as const }
  if (props.status === 'draft') return { label: 'Черновик', color: 'neutral' as const }
  return null
})
</script>

<template>
  <UDashboardToolbar :ui="{ left: 'flex-1 min-w-0' }">
    <template #left>
      <UInput
        v-model="title"
        placeholder="Форма без названия"
        variant="none"
        size="lg"
        class="min-w-0 flex-1"
        :ui="{
          base: 'font-bold text-gray-900 dark:text-white px-0 rounded-none bg-transparent transition-all border-b border-transparent hover:border-default focus:border-primary-500 focus:ring-0'
        }"
      />

      <UBadge
        v-if="statusBadge"
        :color="statusBadge.color"
        variant="subtle"
        size="md"
        class="shrink-0"
      >
        {{ statusBadge.label }}
      </UBadge>
    </template>

    <template #right>
      <slot name="actions" />

      <UButton
        v-if="status === 'draft'"
        color="neutral"
        variant="outline"
        icon="i-lucide-rocket"
        size="sm"
        @click="emit('publish')"
      >
        Опубликовать
      </UButton>

      <UButton
        v-if="status === 'published'"
        color="neutral"
        variant="outline"
        icon="i-lucide-archive"
        size="sm"
        @click="emit('archive')"
      >
        В архив
      </UButton>

      <UButton
        size="sm"
        icon="i-lucide-save"
        :loading="saving"
        @click="emit('submit')"
      >
        Сохранить
      </UButton>
    </template>
  </UDashboardToolbar>
</template>
