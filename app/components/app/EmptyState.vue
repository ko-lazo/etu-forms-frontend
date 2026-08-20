<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string
  title: string
  description?: string
  filtered?: boolean
}>(), { icon: 'i-lucide-inbox', description: undefined })

defineEmits<{
  reset: []
}>()
</script>

<template>
  <div class="flex flex-col items-center gap-3 text-center">
    <UIcon
      :name="filtered ? 'i-lucide-search-x' : icon"
      class="size-10 text-dimmed"
    />

    <p class="text-lg font-medium">
      {{ filtered ? 'Ничего не найдено' : title }}
    </p>

    <p
      v-if="filtered || description"
      class="max-w-sm text-sm text-muted"
    >
      {{ filtered ? 'Под выбранные условия ничего не подходит.' : description }}
    </p>

    <UButton
      v-if="filtered"
      icon="i-lucide-filter-x"
      size="sm"
      color="neutral"
      variant="subtle"
      @click="$emit('reset')"
    >
      Сбросить фильтры
    </UButton>
    <slot v-else />
  </div>
</template>
