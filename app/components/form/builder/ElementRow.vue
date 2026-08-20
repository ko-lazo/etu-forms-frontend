<script setup lang="ts">
import type { EditorElement } from '~/types/form/editor'
import { metaFor } from './element-meta.ts'

defineProps<{
  element: EditorElement
  selected?: boolean
  dragOver?: boolean
}>()

const emit = defineEmits<{
  select: []
  duplicate: []
  remove: []
}>()
</script>

<template>
  <li
    class="group flex items-center gap-3 rounded-lg border border-default bg-default p-3 transition-colors"
    :class="[
      dragOver && 'border-primary bg-primary/5',
      selected && 'border-primary bg-primary/5 ring-1 ring-primary'
    ]"
  >
    <UIcon
      name="i-lucide-grip-vertical"
      class="size-4 shrink-0 cursor-grab text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100"
    />

    <UIcon
      :name="metaFor(element.type).icon"
      class="size-4 shrink-0 text-neutral-500"
    />

    <button
      type="button"
      class="min-w-0 flex-1 text-left"
      @click="emit('select')"
    >
      <div class="flex items-center gap-2">
        <p class="truncate text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          {{ element.label }}
        </p>
        <UBadge
          v-if="element.required"
          color="neutral"
          variant="subtle"
          size="sm"
        >
          Обязательное
        </UBadge>
        <UBadge
          v-if="element.visibleIf"
          color="primary"
          variant="subtle"
          size="sm"
          icon="i-lucide-git-branch"
        >
          Условие
        </UBadge>
      </div>
      <p class="truncate text-xs font-mono text-neutral-400 mt-0.5">
        {{ metaFor(element.type).label }} · {{ element.name }}
      </p>
    </button>

    <div class="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <UButton
        icon="i-lucide-pencil"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="emit('select')"
      />
      <UButton
        icon="i-lucide-copy"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="emit('duplicate')"
      />
      <UButton
        icon="i-lucide-trash-2"
        color="error"
        variant="ghost"
        size="sm"
        @click="emit('remove')"
      />
    </div>
  </li>
</template>
