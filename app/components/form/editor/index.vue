<script setup lang="ts">
import type { EditorElement, EditorMode, EditorModel, EditorPage } from '~/features/forms/editor/editor-model'
import type { FormStatus } from '~/features/forms/types'
import { renameField } from '~/features/forms/editor/rename-field'

const model = defineModel<EditorModel>({ required: true })

defineProps<{
  saving?: boolean
  dirty?: boolean
  status?: FormStatus
}>()

const emit = defineEmits<{
  submit: []
  publish: []
  archive: []
  reset: []
}>()

const mode = ref<EditorMode>('build')
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

function onRename({ from, to }: { from: string, to: string }) {
  renameField(model.value.schema.pages, from, to)
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <AppNavbar />

      <FormEditorToolbar
        v-model="model.title"
        v-model:mode="mode"
        :saving="saving"
        :dirty="dirty"
        :status="status"
        @submit="emit('submit')"
        @publish="emit('publish')"
        @archive="emit('archive')"
        @reset="emit('reset')"
      >
        <template #actions>
          <slot name="actions" />
        </template>
      </FormEditorToolbar>
    </template>

    <template #body>
      <FormEditorCanvas
        v-if="mode === 'build'"
        v-model:pages="model.schema.pages"
        v-model:page-index="activePageIndex"
        v-model:selected-id="selectedId"
      />

      <FormEditorPreview
        v-else
        :model="model"
      />
    </template>
  </UDashboardPanel>

  <UDashboardPanel
    v-if="mode === 'build'"
    id="inspector"
    :default-size="26"
    class="hidden lg:flex"
  >
    <FormEditorInspector
      v-model="selectedElement"
      :available-fields="allFields"
      @rename="onRename"
    />
  </UDashboardPanel>
</template>
