<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { FormElement, FormPage } from '~/types/form/schema/form-schema.schema.ts'
import { ELEMENT_TYPES, createElement, metaFor } from './element-meta.ts'

const model = defineModel<{
  title: string
  schema: { pages: FormPage[] }
}>({ required: true })

defineProps<{
  saving?: boolean
}>()

const emit = defineEmits<{
  submit: []
}>()

const activePageIndex = ref(0)

const activePageTabValue = computed({
  get: () => String(activePageIndex.value),
  set: (value: string) => {
    activePageIndex.value = Number(value)
  }
})

const activePage = computed<FormPage>(() => {
  return model.value.schema.pages[activePageIndex.value] ?? model.value.schema.pages[0]!
})

const pageTabs = computed(() =>
  model.value.schema.pages.map((page, index) => ({
    label: page.title || page.name,
    value: String(index)
  }))
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

// --- drag & drop reordering (native HTML5 DnD, no extra dependency) ---
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
  <div class="space-y-6">
    <div class="flex items-start justify-between gap-4">
      <UFormField
        label="Название формы"
        required
        class="max-w-lg flex-1"
      >
        <UInput
          v-model="model.title"
          size="lg"
          placeholder="Форма без названия"
          class="w-full"
        />
      </UFormField>

      <UButton
        size="lg"
        icon="i-lucide-save"
        :loading="saving"
        @click="emit('submit')"
      >
        Сохранить
      </UButton>
    </div>

    <div class="flex items-center gap-2 border-b border-default pb-3">
      <UTabs
        v-model="activePageTabValue"
        :items="pageTabs"
        class="flex-1"
      />

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
        @click="removePage(activePageIndex)"
      />
    </div>

    <UFormField label="Заголовок страницы">
      <UInput
        v-model="activePage.title"
        class="max-w-sm"
        placeholder="Заголовок страницы"
      />
    </UFormField>

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
            class="size-4 shrink-0 cursor-grab text-muted opacity-0 transition-opacity group-hover:opacity-100"
          />

          <UIcon
            :name="metaFor(element.type).icon"
            class="size-4 shrink-0 text-muted"
          />

          <button
            type="button"
            class="min-w-0 flex-1 text-left"
            @click="openEditor(element, index)"
          >
            <div class="flex items-center gap-2">
              <p class="truncate font-medium">
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
            </div>
            <p class="truncate text-xs text-muted">
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
          variant="subtle"
        >
          Добавить поле
        </UButton>
      </UDropdownMenu>
    </template>

    <FormBuilderElementEditor
      :element="editingElement"
      @save="saveElement"
      @close="closeEditor"
    />
  </div>
</template>
