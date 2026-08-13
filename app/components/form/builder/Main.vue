<script setup lang="ts">
import type { EditorElement, EditorModel, EditorPage } from '~/types/form/editor.ts'
import { renameConditionField } from '~/utils/condition.ts'

const model = defineModel<EditorModel>({ required: true })

defineProps<{
  saving?: boolean
  dirty?: boolean
  status?: 'draft' | 'published' | 'archived'
}>()

const emit = defineEmits<{
  submit: []
  publish: []
  archive: []
  reset: []
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

/**
 * Условия ссылаются на поля по `name`, поэтому переименование обновляет ссылки
 * по всей форме
 */
function renameField({ from, to }: { from: string, to: string }) {
  const element = selectedElement.value
  if (!element) return

  element.name = to

  for (const page of model.value.schema.pages) {
    renameConditionField(page.visibleIf, from, to)
    page.elements.forEach(item => renameConditionField(item.visibleIf, from, to))
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <AppNavbar />

      <FormBuilderToolbar
        v-model="model.title"
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
      @rename="renameField"
    />
  </UDashboardPanel>
</template>
