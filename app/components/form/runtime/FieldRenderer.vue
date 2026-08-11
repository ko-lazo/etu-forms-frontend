<script setup lang="ts">
import { computed } from 'vue'
import type { FormElement } from '~/types/form/schema/form-schema.schema'

const props = defineProps<{
  element: FormElement
  modelValue: unknown
  error?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
}>()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const value = computed<any>({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

const choiceItems = computed(() => {
  if (!('choices' in props.element)) return []
  return props.element.choices.map(c => ({ label: c.text, value: c.value }))
})

function onFileChange(event: Event) {
  const files = Array.from((event.target as HTMLInputElement).files ?? [])
  value.value = files.map(f => f.name)
}
</script>

<template>
  <!-- todo refactor -->
  <UFormField
    :label="element.label"
    :required="element.required"
    :error="error"
    size="lg"
  >
    <UInput
      v-if="element.type === 'text' || element.type === 'email'"
      v-model="value"
      :type="element.type === 'email' ? 'email' : 'text'"
      :placeholder="element.placeholder"
      size="lg"
      class="w-full"
    />

    <UTextarea
      v-else-if="element.type === 'textarea'"
      v-model="value"
      :placeholder="element.placeholder"
      size="lg"
      class="w-full"
      :rows="4"
    />

    <UInputNumber
      v-else-if="element.type === 'number'"
      v-model="value"
      :placeholder="element.placeholder"
      size="lg"
      class="w-full"
    />

    <USelect
      v-else-if="element.type === 'dropdown'"
      v-model="value"
      :items="choiceItems"
      :placeholder="element.placeholder ?? 'Выберите вариант'"
      size="lg"
      class="w-full"
    />

    <URadioGroup
      v-else-if="element.type === 'radiogroup'"
      v-model="value"
      :items="choiceItems"
    />

    <UCheckboxGroup
      v-else-if="element.type === 'checkbox'"
      v-model="value"
      :items="choiceItems"
    />

    <div v-else-if="element.type === 'file'">
      <UInput
        type="file"
        multiple
        size="lg"
        class="w-full"
        @change="onFileChange"
      />
      <p class="mt-1 text-xs text-muted">
        Файлы прикладываются именами - реальная загрузка на сервер пока не подключена.
      </p>
    </div>
  </UFormField>
</template>
