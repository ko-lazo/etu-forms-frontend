<script setup lang="ts">
import type { EditorElement } from '~/types/form/editor'
import { metaFor } from './element-meta.ts'

const element = defineModel<EditorElement | null>({ required: true })

defineProps<{
  availableFields: EditorElement[]
}>()

const emit = defineEmits<{
  rename: [payload: { from: string, to: string }]
}>()

const meta = computed(() => (element.value ? metaFor(element.value.type) : null))
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <div class="flex h-(--ui-header-height) shrink-0 items-center gap-1.5 border-b border-default px-4 sm:px-6">
      <UIcon
        :name="meta?.icon ?? 'i-lucide-settings-2'"
        class="size-5 shrink-0 text-muted"
      />
      <p class="truncate font-semibold text-highlighted">
        {{ meta ? meta.label : 'Настройки формы' }}
      </p>

      <UButton
        v-if="element"
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        size="sm"
        class="ms-auto"
        @click="element = null"
      />
    </div>

    <div class="flex-1 overflow-y-auto p-4 sm:p-6">
      <FormBuilderElementEditor
        v-if="element"
        v-model="element"
        :available-fields="availableFields"
        @rename="emit('rename', $event)"
      />

      <UEmpty
        v-else
        icon="i-lucide-mouse-pointer-click"
        title="Поле не выбрано"
        description="Выберите поле в конструкторе, чтобы изменить его настройки."
      />
    </div>
  </div>
</template>
