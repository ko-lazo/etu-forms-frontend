<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  retryable?: boolean
}>()

defineEmits<{
  retry: []
}>()
</script>

<template>
  <UAlert
    color="error"
    variant="subtle"
    icon="i-lucide-alert-triangle"
    :title="title"
    :description="description"
  >
    <template
      v-if="retryable"
      #actions
    >
      <UButton
        size="sm"
        color="error"
        variant="subtle"
        @click="$emit('retry')"
      >
        Повторить
      </UButton>
    </template>
  </UAlert>
</template>
