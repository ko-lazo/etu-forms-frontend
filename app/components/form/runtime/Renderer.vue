<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { FormPage } from '~/features/forms/schema/form-schema'
import type { FormInput } from '~/features/forms/runtime/input'

const props = withDefaults(defineProps<{
  pages: FormPage[]
  input: FormInput
  errors: Record<string, string>
  title?: string
  submitting?: boolean
  submitLabel?: string
}>(), {
  submitLabel: 'Отправить'
})

const emit = defineEmits<{
  'update:value': [name: string, value: unknown]
  'submit': []
}>()

const fieldRefs = new Map<string, HTMLElement>()

function setFieldRef(name: string, el: Element | ComponentPublicInstance | null) {
  if (el instanceof HTMLElement) {
    fieldRefs.set(name, el)
  } else {
    fieldRefs.delete(name)
  }
}

async function scrollToFirstError() {
  const first = Object.keys(props.errors)[0]
  if (!first) return

  await nextTick()
  fieldRefs.get(first)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

defineExpose({ scrollToFirstError })
</script>

<template>
  <div>
    <div
      v-if="title !== undefined"
      class="overflow-hidden rounded-xl border border-default bg-default"
    >
      <div class="h-2 bg-primary" />
      <div class="p-6">
        <h1 class="text-2xl font-bold">
          {{ title }}
        </h1>
      </div>
    </div>

    <slot name="before" />

    <form
      class="mt-6 space-y-6"
      @submit.prevent="emit('submit')"
    >
      <section
        v-for="(page, pageIndex) in pages"
        :key="page.name"
        class="overflow-hidden rounded-xl border border-default bg-default"
      >
        <div class="flex items-center gap-3 border-b border-default bg-elevated/40 px-6 py-3">
          <span class="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-inverted">
            {{ pageIndex + 1 }}
          </span>
          <h2 class="font-semibold">
            {{ page.title || page.name }}
          </h2>
        </div>

        <div
          v-if="page.elements.length === 0"
          class="p-6 text-sm text-muted"
        >
          На этой странице нет полей.
        </div>

        <div
          v-else
          class="space-y-6 p-6"
        >
          <div
            v-for="field in page.elements"
            :ref="(el) => setFieldRef(field.name, el)"
            :key="field.name"
          >
            <FormRuntimeFieldRenderer
              :element="field"
              :model-value="input[field.name]"
              :error="errors[field.name]"
              @update:model-value="(value) => emit('update:value', field.name, value)"
            />
          </div>
        </div>
      </section>

      <div class="flex items-center justify-between">
        <p class="text-xs text-muted">
          <slot name="status" />
        </p>

        <UButton
          type="submit"
          size="lg"
          icon="i-lucide-send"
          :loading="submitting"
        >
          {{ submitLabel }}
        </UButton>
      </div>
    </form>
  </div>
</template>
