<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { EditorPage } from '~/types/form/editor.ts'
import { ELEMENT_TYPES, createElement } from './element-meta.ts'
import { createUid } from '~/utils/uid.ts'

const pages = defineModel<EditorPage[]>('pages', { required: true })
const pageIndex = defineModel<number>('pageIndex', { required: true })
const selectedId = defineModel<string | null>('selectedId', { required: true })

const activePage = computed<EditorPage>(() => {
  return pages.value[pageIndex.value] ?? pages.value[0]!
})

function selectPage(index: number) {
  pageIndex.value = index
  selectedId.value = null
}

function addPage() {
  const index = pages.value.length + 1
  pages.value.push({
    name: `page${index}`,
    title: `Страница ${index}`,
    elements: []
  })
  selectPage(pages.value.length - 1)
}

function removePage(index: number) {
  if (pages.value.length <= 1) return
  pages.value.splice(index, 1)
  selectPage(Math.max(0, pageIndex.value - 1))
}

const addFieldItems = computed<DropdownMenuItem[][]>(() => [
  ELEMENT_TYPES.map(item => ({
    label: item.label,
    icon: item.icon,
    onSelect: () => addElement(item.type)
  }))
])

function addElement(type: (typeof ELEMENT_TYPES)[number]['type']) {
  const element = createElement(type)
  activePage.value.elements.push(element)
  selectedId.value = element._uid
}

function removeElement(index: number) {
  const [removed] = activePage.value.elements.splice(index, 1)
  if (removed?._uid === selectedId.value) selectedId.value = null
}

function duplicateElement(index: number) {
  const source = activePage.value.elements[index]!
  const copy = structuredClone(toRaw(source))
  copy._uid = createUid()
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
</script>

<template>
  <div class="mx-auto w-full max-w-3xl space-y-3">
    <div class="flex flex-wrap items-center gap-2 border-b border-default pb-3">
      <button
        v-for="(page, index) in pages"
        :key="page.name"
        type="button"
        class="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
        :class="index === pageIndex
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-default text-muted hover:text-default hover:border-muted'"
        @click="selectPage(index)"
      >
        <span
          class="flex size-4 items-center justify-center rounded-sm text-[10px] font-bold"
          :class="index === pageIndex ? 'bg-primary text-inverted' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600'"
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
        v-if="pages.length > 1"
        icon="i-lucide-trash-2"
        color="error"
        variant="ghost"
        size="sm"
        class="ms-auto"
        @click="removePage(pageIndex)"
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
        <FormBuilderElementRow
          v-for="(element, index) in activePage.elements"
          :key="element._uid"
          :element="element"
          :selected="element._uid === selectedId"
          :drag-over="dragOverIndex === index && dragIndex !== index"
          draggable="true"
          @dragstart="onDragStart(index)"
          @dragover.prevent="onDragOver(index)"
          @drop.prevent="onDrop(index)"
          @dragend="onDragEnd"
          @select="selectedId = element._uid"
          @duplicate="duplicateElement(index)"
          @remove="removeElement(index)"
        />
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
  </div>
</template>
