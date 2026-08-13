<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import type { BuilderMode } from './mode.ts'

const title = defineModel<string>({ required: true })
const mode = defineModel<BuilderMode>('mode', { required: true })

const props = defineProps<{
  saving?: boolean
  dirty?: boolean
  status?: 'draft' | 'published' | 'archived'
}>()

const emit = defineEmits<{
  submit: []
  publish: []
  archive: []
  reset: []
  inspect: []
}>()

const statusBadge = computed(() => {
  if (props.status === 'published') return { label: 'Опубликована', color: 'success' as const }
  if (props.status === 'archived') return { label: 'В архиве', color: 'warning' as const }
  if (props.status === 'draft') return { label: 'Черновик', color: 'neutral' as const }
  return null
})

const modeItems: TabsItem[] = [
  { label: 'Конструктор', icon: 'i-lucide-pencil-ruler', value: 'build' },
  { label: 'Предпросмотр', icon: 'i-lucide-eye', value: 'preview' }
]
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

      <UBadge
        v-if="dirty"
        color="warning"
        variant="subtle"
        size="md"
        icon="i-lucide-pencil-line"
        class="shrink-0"
      >
        Не сохранено
      </UBadge>
    </template>

    <template #right>
      <UTabs
        :model-value="mode"
        :items="modeItems"
        :content="false"
        size="sm"
        class="shrink-0"
        :ui="{ label: 'hidden sm:block' }"
        @update:model-value="(value) => mode = value as BuilderMode"
      />

      <UButton
        icon="i-lucide-settings-2"
        color="neutral"
        variant="ghost"
        size="sm"
        class="lg:hidden"
        @click="emit('inspect')"
      />

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
        v-if="dirty"
        icon="i-lucide-rotate-ccw"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="emit('reset')"
      >
        Сбросить
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
