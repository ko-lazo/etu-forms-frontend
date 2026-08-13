<script setup lang="ts">
import type { EditorElement, EditorModel, EditorPage } from '~/types/form/editor.ts'

const model = defineModel<EditorModel>({ required: true })

defineProps<{
  saving?: boolean
  status?: 'draft' | 'published' | 'archived'
}>()

const emit = defineEmits<{
  submit: []
  publish: []
  archive: []
}>()

const activePageIndex = ref(0)
const selectedId = ref<string | null>(null)

const activePage = computed<EditorPage>(() => {
  return model.value.schema.pages[activePageIndex.value] ?? model.value.schema.pages[0]!
})

const allFields = computed<EditorElement[]>(() =>
  model.value.schema.pages.flatMap(page => page.elements)
)

const selectedElement = computed<EditorElement | null>(() =>
  activePage.value.elements.find(element => element._uid === selectedId.value) ?? null
)

function saveElement(element: EditorElement) {
  const index = activePage.value.elements.findIndex(item => item._uid === element._uid)
  if (index === -1) return

  activePage.value.elements.splice(index, 1, element)
  selectedId.value = null
}
</script>

<template>
  <div class="space-y-3">
    <FormBuilderToolbar
      v-model="model.title"
      :saving="saving"
      :status="status"
      @submit="emit('submit')"
      @publish="emit('publish')"
      @archive="emit('archive')"
    />

    <FormBuilderCanvas
      v-model:pages="model.schema.pages"
      v-model:page-index="activePageIndex"
      v-model:selected-id="selectedId"
    />

    <FormBuilderElementEditor
      :element="selectedElement"
      :available-fields="allFields"
      @save="saveElement"
      @close="selectedId = null"
    />
  </div>
</template>
