<script setup lang="ts">
import type { DropdownMenuItem, TabsItem } from '@nuxt/ui'
import type { FormStatus } from '~/features/forms/types'
import { FORM_STATUS, FORM_STATUS_META } from '~/features/forms/constants'
import type { EditorMode } from '~/features/forms/editor/editor-model'
import { EDITOR_MODE } from '~/features/forms/editor/editor-model'

const title = defineModel<string>({ required: true })
const mode = defineModel<EditorMode>('mode', { required: true })

const props = defineProps<{
  saving?: boolean
  dirty?: boolean
  status?: FormStatus
}>()

const emit = defineEmits<{
  submit: []
  publish: []
  archive: []
  reset: []
  inspect: []
}>()

const statusMeta = computed(() => (props.status ? FORM_STATUS_META[props.status] : null))

const modeItems: TabsItem[] = [
  { label: 'Конструктор', icon: 'i-lucide-pencil-ruler', value: EDITOR_MODE.BUILD },
  { label: 'Предпросмотр', icon: 'i-lucide-eye', value: EDITOR_MODE.PREVIEW },
  {
    label: 'ИИ-конструктор',
    icon: 'i-lucide-sparkles',
    value: EDITOR_MODE.AI,
    badge: { label: 'бета', color: 'dark', variant: 'subtle' }
  }
]

const menuItems = computed<DropdownMenuItem[][]>(() => {
  const lifecycle: DropdownMenuItem[] = []

  if (props.status === FORM_STATUS.DRAFT) {
    lifecycle.push({
      label: 'Опубликовать',
      icon: 'i-lucide-rocket',
      onSelect: () => emit('publish')
    })
  }

  if (props.status === FORM_STATUS.PUBLISHED) {
    lifecycle.push({
      label: 'В архив',
      icon: 'i-lucide-archive',
      onSelect: () => emit('archive')
    })
  }

  const changes: DropdownMenuItem[] = []

  if (props.dirty) {
    changes.push({
      label: 'Сбросить изменения',
      icon: 'i-lucide-rotate-ccw',
      color: 'error',
      onSelect: () => emit('reset')
    })
  }

  return [lifecycle, changes].filter(group => group.length > 0)
})
</script>

<template>
  <div class="flex flex-col w-full border-b border-gray-200 dark:border-gray-800">
    <div class="flex items-center justify-between w-full px-4 py-3 gap-4">
      <div class="flex min-w-0 flex-1 items-center">
        <UInput
          v-model="title"
          placeholder="Форма без названия"
          aria-label="Название формы"
          variant="none"
          class="min-w-0 flex-1"
          :ui="{
            base: 'truncate px-0 text-base sm:text-lg font-semibold text-highlighted bg-transparent rounded-none border-b border-transparent transition-colors hover:border-default focus:border-primary focus:ring-0'
          }"
        />
      </div>

      <div class="flex items-center gap-1.5 shrink-0">
        <div class="hidden items-center gap-1.5 md:flex">
          <slot name="actions" />
        </div>

        <UButton
          icon="i-lucide-settings-2"
          color="neutral"
          variant="ghost"
          size="sm"
          aria-label="Настройки элемента"
          class="lg:hidden"
          @click="emit('inspect')"
        />

        <UFieldGroup size="sm">
          <UButton
            icon="i-lucide-save"
            :variant="dirty ? 'solid' : 'soft'"
            :loading="saving"
            :ui="{ label: 'hidden sm:inline' }"
            @click="emit('submit')"
          >
            Сохранить
          </UButton>

          <UDropdownMenu
            v-if="menuItems.length"
            :items="menuItems"
            :content="{ align: 'end' }"
          >
            <UButton
              icon="i-lucide-chevron-down"
              :variant="dirty ? 'solid' : 'soft'"
              aria-label="Другие действия"
            />
          </UDropdownMenu>
        </UFieldGroup>
      </div>
    </div>

    <div class="flex items-center justify-between w-full px-4 py-2 border-t border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-800/20 gap-4">
      <UTabs
        :model-value="mode"
        :items="modeItems"
        :content="false"
        size="sm"
        class="shrink-0"
        :ui="{ label: 'hidden md:block' }"
        @update:model-value="(value) => mode = value as EditorMode"
      />

      <div class="flex shrink-0 items-center gap-3 text-xs">
        <span
          v-if="statusMeta"
          class="inline-flex items-center gap-1.5 rounded-full bg-elevated px-2 py-0.5 font-medium text-muted"
        >
          <span
            class="size-1.5 rounded-full"
            :class="statusMeta.dot"
          />
          {{ statusMeta.label }}
        </span>

        <UTooltip
          v-if="dirty"
          text="Есть несохранённые изменения"
        >
          <span class="inline-flex items-center gap-1.5 font-medium text-warning">
            <span class="size-1.5 rounded-full bg-warning" />
            <span class="hidden md:inline">Не сохранено</span>
          </span>
        </UTooltip>
      </div>
    </div>
  </div>
</template>
