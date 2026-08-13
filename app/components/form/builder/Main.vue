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

const selectedElement = computed<EditorElement | null>({
  get: () => activePage.value.elements.find(element => element._uid === selectedId.value) ?? null,
  set: (value) => {
    if (!value) {
      selectedId.value = null
      return
    }

    const index = activePage.value.elements.findIndex(element => element._uid === value._uid)
    if (index === -1) return

    activePage.value.elements.splice(index, 1, value)
  }
})
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <AppNavbar />

      <FormBuilderToolbar
        v-model="model.title"
        :saving="saving"
        :status="status"
        @submit="emit('submit')"
        @publish="emit('publish')"
        @archive="emit('archive')"
      >
        <template #actions>
          <slot name="actions" />
        </template>
      </FormBuilderToolbar>
    </template>

    <template #body>
      <FormBuilderCanvas
        v-model:pages="model.schema.pages"
        v-model:page-index="activePageIndex"
        v-model:selected-id="selectedId"
      />
    </template>
  </UDashboardPanel>

  <UDashboardPanel
    id="inspector"
    :default-size="26"
    class="hidden lg:flex"
  >
    <FormBuilderInspector
      v-model="selectedElement"
      :available-fields="allFields"
    />
  </UDashboardPanel>
</template>
