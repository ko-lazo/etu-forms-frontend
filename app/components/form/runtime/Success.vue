<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
}>(), {
  title: 'Спасибо! Ваш ответ отправлен',
  description: 'Можно закрыть эту страницу.'
})
</script>

<template>
  <div class="rounded-xl border border-default bg-default p-10 text-center">
    <UIcon
      name="i-lucide-circle-check"
      class="mx-auto size-12 text-primary"
    />
    <h1 class="mt-4 text-xl font-semibold">
      {{ title }}
    </h1>
    <p class="mt-1 text-sm text-muted">
      {{ description }}
    </p>

    <div
      v-if="$slots.actions"
      class="mt-6 flex justify-center"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
