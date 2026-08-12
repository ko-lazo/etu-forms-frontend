<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { FormElement, FormPage } from '~/types/form/schema/form-schema.schema.ts'
import { ELEMENT_TYPES, createElement, metaFor } from './element-meta.ts'

const model = defineModel<{
  title: string
  schema: { pages: FormPage[] }
}>({ required: true })

const props = defineProps<{
  saving?: boolean
  status?: 'draft' | 'published' | 'archived'
}>()

const emit = defineEmits<{
  submit: []
  publish: []
  archive: []
}>()

const activePageIndex = ref(0)

const activePage = computed<FormPage>(() => {
  return model.value.schema.pages[activePageIndex.value] ?? model.value.schema.pages[0]!
})

const allFields = computed<FormElement[]>(() =>
  model.value.schema.pages.flatMap(page => page.elements)
)

function addPage() {
  const index = model.value.schema.pages.length + 1
  model.value.schema.pages.push({
    name: `page${index}`,
    title: `Страница ${index}`,
    elements: []
  })
  activePageIndex.value = model.value.schema.pages.length - 1
}

function removePage(index: number) {
  if (model.value.schema.pages.length <= 1) return
  model.value.schema.pages.splice(index, 1)
  activePageIndex.value = Math.max(0, activePageIndex.value - 1)
}

const addFieldItems = computed<DropdownMenuItem[][]>(() => [
  ELEMENT_TYPES.map(item => ({
    label: item.label,
    icon: item.icon,
    onSelect: () => addElement(item.type)
  }))
])

const editingElement = ref<FormElement | null>(null)
const editingIndex = ref<number | null>(null)

function addElement(type: (typeof ELEMENT_TYPES)[number]['type']) {
  const element = createElement(type)
  activePage.value.elements.push(element)
  openEditor(element, activePage.value.elements.length - 1)
}

function openEditor(element: FormElement, index: number) {
  editingElement.value = element
  editingIndex.value = index
}

function closeEditor() {
  editingElement.value = null
  editingIndex.value = null
}

function saveElement(element: FormElement) {
  if (editingIndex.value === null) return
  activePage.value.elements.splice(editingIndex.value, 1, element)
  closeEditor()
}

function removeElement(index: number) {
  activePage.value.elements.splice(index, 1)
}

function duplicateElement(index: number) {
  const source = activePage.value.elements[index]!
  const copy = structuredClone(toRaw(source))
  copy.name = `${copy.name}_copy`
  activePage.value.elements.splice(index + 1, 0, copy)
}

const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function onDragStart(index: number) {
  dragIndex.value = index
}

function onDragOver(index: number) {
  dragOverIndex.value = index
}

function onDrop(index: number) {
  if (dragIndex.value === null || dragIndex.value === index) {
    dragIndex.value = null
    dragOverIndex.value = null
    return
  }

  const elements = activePage.value.elements
  const [moved] = elements.splice(dragIndex.value, 1)
  elements.splice(index, 0, moved!)

  dragIndex.value = null
  dragOverIndex.value = null
}

function onDragEnd() {
  dragIndex.value = null
  dragOverIndex.value = null
}

const statusBadge = computed(() => {
  if (props.status === 'published') return { label: 'Опубликована', color: 'success' as const }
  if (props.status === 'archived') return { label: 'В архиве', color: 'warning' as const }
  if (props.status === 'draft') return { label: 'Черновик', color: 'neutral' as const }
  return null
})
</script>

<template>
  <div class="space-y-3">
    <div class="space-y-2 border-b border-default pb-5">
      <UInput
        v-model="model.title"
        placeholder="Форма без названия"
        variant="none"
        class="w-full"
        size="xl"
        :ui="{
          base: 'font-bold text-gray-900 dark:text-white px-0 rounded-none bg-transparent transition-all border-b border-transparent hover:border-default focus:border-primary-500 focus:ring-0'
        }"
      />
      <div class="flex items-center gap-2">
        <UBadge
          v-if="statusBadge"
          :color="statusBadge.color"
          variant="subtle"
          size="md"
        >
          {{ statusBadge.label }}
        </UBadge>

        <div class="flex items-center gap-2 ms-auto">
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
        </div>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2 border-b border-default pb-3">
      <button
        v-for="(page, index) in model.schema.pages"
        :key="page.name"
        type="button"
        class="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
        :class="index === activePageIndex
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-default text-muted hover:text-default hover:border-muted'"
        @click="activePageIndex = index"
      >
        <span
          class="flex size-4 items-center justify-center rounded-sm text-[10px] font-bold"
          :class="index === activePageIndex ? 'bg-primary text-inverted' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600'"
        >{{ index + 1 }}</span>
        {{ page.title || page.name }}
      </button>

      <UButton
        icon="i-lucide-plus"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="addPage"
      >
        Добавить страницу
      </UButton>

      <UButton
        v-if="model.schema.pages.length > 1"
        icon="i-lucide-trash-2"
        color="error"
        variant="ghost"
        size="sm"
        class="ms-auto"
        @click="removePage(activePageIndex)"
      />
    </div>

    <div class="w-full">
      <UInput
        v-model="activePage.title"
        placeholder="Заголовок текущей страницы"
        variant="none"
        class="w-full"
        size="lg"
        :ui="{
          base: 'font-bold text-gray-900 dark:text-white px-0 rounded-none bg-transparent transition-all border-b border-transparent hover:border-default focus:border-primary-500 focus:ring-0'
        }"
      />
    </div>

    <div
      v-if="activePage.elements.length === 0"
      class="flex flex-col items-center gap-3 rounded-lg border border-dashed border-default py-12 text-center"
    >
      <UIcon
        name="i-lucide-mouse-pointer-click"
        class="size-8 text-muted"
      />
      <p class="text-sm text-muted">
        На этой странице пока нет полей.
      </p>
      <UDropdownMenu :items="addFieldItems">
        <UButton
          icon="i-lucide-plus"
          color="neutral"
          variant="subtle"
        >
          Добавить поле
        </UButton>
      </UDropdownMenu>
    </div>

    <template v-else>
      <ul class="space-y-2">
        <li
          v-for="(element, index) in activePage.elements"
          :key="`${element.name}-${index}`"
          class="group flex items-center gap-3 rounded-lg border border-default bg-default p-3 transition-colors"
          :class="{ 'border-primary bg-primary/5': dragOverIndex === index && dragIndex !== index }"
          draggable="true"
          @dragstart="onDragStart(index)"
          @dragover.prevent="onDragOver(index)"
          @drop.prevent="onDrop(index)"
          @dragend="onDragEnd"
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
            @click="openEditor(element, index)"
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
              @click="openEditor(element, index)"
            />
            <UButton
              icon="i-lucide-copy"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="duplicateElement(index)"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="sm"
              @click="removeElement(index)"
            />
          </div>
        </li>
      </ul>

      <UDropdownMenu :items="addFieldItems">
        <UButton
          icon="i-lucide-plus"
          color="neutral"
          variant="outline"
          size="md"
          class="w-full justify-center border-dashed"
        >
          Добавить поле
        </UButton>
      </UDropdownMenu>
    </template>

    <FormBuilderElementEditor
      :element="editingElement"
      :available-fields="allFields"
      @save="saveElement"
      @close="closeEditor"
    />
  </div>
</template>
