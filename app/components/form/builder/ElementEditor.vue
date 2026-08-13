<script setup lang="ts">
import type { EditorElement } from '~/types/form/editor.ts'
import { metaFor } from './element-meta.ts'

const props = defineProps<{
  element: EditorElement | null
  availableFields: EditorElement[]
}>()

const emit = defineEmits<{
  save: [element: EditorElement]
  close: []
}>()

const open = computed({
  get: () => props.element !== null,
  set: (value) => {
    if (!value) emit('close')
  }
})

const draft = ref<EditorElement | null>(null)

watch(() => props.element, (element) => {
  if (!element) return

  const clone = structuredClone(toRaw(element))

  if ((clone.type === 'text' || clone.type === 'email' || clone.type === 'textarea') && !clone.validation) {
    clone.validation = {}
  }
  if (clone.type === 'number' && !clone.validation) {
    clone.validation = {}
  }
  if (clone.type === 'file' && !clone.validation) {
    clone.validation = { maxFileSizeMb: 5, maxFilesCount: 1 }
  }

  draft.value = clone
}, { immediate: true })

const conditionFields = computed(() =>
  props.availableFields.filter(f => f.name !== draft.value?.name)
)

const meta = computed(() => (draft.value ? metaFor(draft.value.type) : null))

function addChoice() {
  if (!draft.value || !('choices' in draft.value)) return
  const index = draft.value.choices.length + 1
  draft.value.choices.push({ value: `option_${index}`, text: `Вариант ${index}` })
}

function removeChoice(index: number) {
  if (!draft.value || !('choices' in draft.value)) return
  draft.value.choices.splice(index, 1)
}

function save() {
  if (!draft.value) return
  emit('save', draft.value)
}
</script>

<template>
  <USlideover
    v-model:open="open"
    :title="meta ? `Редактирование поля: ${meta.label.toLowerCase()}` : 'Редактирование поля'"
  >
    <template #body>
      <div
        v-if="draft"
        class="space-y-6"
      >
        <UFormField
          label="Метка"
          hint="label"
          required
        >
          <UInput
            v-model="draft.label"
            class="w-full"
            placeholder="Название поля, которое видят пользователи"
          />
        </UFormField>

        <UFormField
          label="Ключ поля"
          hint="name"
          required
        >
          <UInput
            v-model="draft.name"
            class="w-full font-mono"
            placeholder="field_name"
          />
        </UFormField>

        <UFormField
          v-if="draft.type !== 'file' && draft.type !== 'radiogroup' && draft.type !== 'checkbox'"
          label="Подсказка"
          hint="placeholder"
        >
          <UInput
            v-model="draft.placeholder"
            class="w-full"
            placeholder="Введите текст-подсказку..."
          />
        </UFormField>

        <UFormField
          label="Обязательное поле"
          hint="required"
        >
          <USwitch v-model="draft.required" />
        </UFormField>

        <template v-if="'choices' in draft">
          <UFormField
            label="Варианты ответов"
            hint="choices"
          >
            <div class="space-y-2">
              <div
                v-for="(choice, index) in draft.choices"
                :key="index"
                class="flex items-center gap-2"
              >
                <UInput
                  v-model="choice.text"
                  class="flex-1"
                  placeholder="Текст (text)"
                />
                <UInput
                  v-model="choice.value"
                  class="flex-1 font-mono"
                  placeholder="Значение (value)"
                />
                <UButton
                  icon="i-lucide-x"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  :disabled="draft.choices.length <= 1"
                  @click="removeChoice(index)"
                />
              </div>

              <UButton
                icon="i-lucide-plus"
                color="neutral"
                variant="subtle"
                size="sm"
                @click="addChoice"
              >
                Добавить вариант
              </UButton>
            </div>
          </UFormField>
        </template>

        <template v-if="draft.type === 'text' || draft.type === 'email' || draft.type === 'textarea'">
          <UFormField
            label="Минимальная длина"
            hint="validation.minLength"
          >
            <UInputNumber
              v-model="draft.validation!.minLength"
              class="w-full"
              :min="0"
            />
          </UFormField>
          <UFormField
            label="Максимальная длина"
            hint="validation.maxLength"
          >
            <UInputNumber
              v-model="draft.validation!.maxLength"
              class="w-full"
              :min="0"
            />
          </UFormField>
        </template>

        <template v-if="draft.type === 'number'">
          <UFormField
            label="Минимальное значение"
            hint="validation.min"
          >
            <UInputNumber
              v-model="draft.validation!.min"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="Максимальное значение"
            hint="validation.max"
          >
            <UInputNumber
              v-model="draft.validation!.max"
              class="w-full"
            />
          </UFormField>
        </template>

        <template v-if="draft.type === 'file'">
          <UFormField
            label="Макс. размер файла (МБ)"
            hint="validation.maxFileSizeMb"
          >
            <UInputNumber
              v-model="draft.validation!.maxFileSizeMb"
              class="w-full"
              :min="1"
            />
          </UFormField>
          <UFormField
            label="Макс. количество файлов"
            hint="validation.maxFilesCount"
          >
            <UInputNumber
              v-model="draft.validation!.maxFilesCount"
              class="w-full"
              :min="1"
            />
          </UFormField>
        </template>

        <USeparator />

        <FormBuilderConditionEditor
          v-model="draft.visibleIf"
          :available-fields="conditionFields"
        />
      </div>
    </template>

    <template #footer>
      <UButton
        color="neutral"
        variant="ghost"
        @click="open = false"
      >
        Отмена
      </UButton>
      <UButton @click="save">
        Сохранить изменения
      </UButton>
    </template>
  </USlideover>
</template>
