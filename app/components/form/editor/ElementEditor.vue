<script setup lang="ts">
import type { EditorElement } from '~/features/forms/editor/editor-model'

const element = defineModel<EditorElement>({ required: true })

const props = defineProps<{
  availableFields: EditorElement[]
}>()

const emit = defineEmits<{
  rename: [payload: { from: string, to: string }]
}>()

const conditionFields = computed(() =>
  props.availableFields.filter(field => field._uid !== element.value._uid)
)

const nameDraft = ref(element.value.name)

watch(element, (value) => {
  nameDraft.value = value.name
})

function commitName() {
  const next = nameDraft.value.trim()

  if (!next || next === element.value.name) {
    nameDraft.value = element.value.name
    return
  }

  emit('rename', { from: element.value.name, to: next })
}

function addChoice() {
  if (!('choices' in element.value)) return
  const index = element.value.choices.length + 1
  element.value.choices.push({ value: `option_${index}`, text: `Вариант ${index}` })
}

function removeChoice(index: number) {
  if (!('choices' in element.value)) return
  element.value.choices.splice(index, 1)
}
</script>

<template>
  <div class="space-y-6">
    <UFormField
      label="Метка"
      hint="label"
      required
    >
      <UInput
        v-model="element.label"
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
        v-model="nameDraft"
        class="w-full font-mono"
        placeholder="field_name"
        @blur="commitName"
        @keydown.enter="commitName"
      />
    </UFormField>

    <UFormField
      v-if="element.type !== 'file' && element.type !== 'radiogroup' && element.type !== 'checkbox'"
      label="Подсказка"
      hint="placeholder"
    >
      <UInput
        v-model="element.placeholder"
        class="w-full"
        placeholder="Введите текст-подсказку..."
      />
    </UFormField>

    <UFormField
      label="Обязательное поле"
      hint="required"
    >
      <USwitch v-model="element.required" />
    </UFormField>

    <template v-if="'choices' in element">
      <UFormField
        label="Варианты ответов"
        hint="choices"
      >
        <div class="space-y-2">
          <div
            v-for="(choice, index) in element.choices"
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
              :disabled="element.choices.length <= 1"
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

    <template v-if="element.type === 'text' || element.type === 'email' || element.type === 'textarea'">
      <UFormField
        label="Минимальная длина"
        hint="validation.minLength"
      >
        <UInputNumber
          v-model="element.validation!.minLength"
          class="w-full"
          :min="0"
        />
      </UFormField>
      <UFormField
        label="Максимальная длина"
        hint="validation.maxLength"
      >
        <UInputNumber
          v-model="element.validation!.maxLength"
          class="w-full"
          :min="0"
        />
      </UFormField>
    </template>

    <template v-if="element.type === 'number'">
      <UFormField
        label="Минимальное значение"
        hint="validation.min"
      >
        <UInputNumber
          v-model="element.validation!.min"
          class="w-full"
        />
      </UFormField>
      <UFormField
        label="Максимальное значение"
        hint="validation.max"
      >
        <UInputNumber
          v-model="element.validation!.max"
          class="w-full"
        />
      </UFormField>
    </template>

    <template v-if="element.type === 'file'">
      <UFormField
        label="Макс. размер файла (МБ)"
        hint="validation.maxFileSizeMb"
      >
        <UInputNumber
          v-model="element.validation!.maxFileSizeMb"
          class="w-full"
          :min="1"
        />
      </UFormField>
      <UFormField
        label="Макс. количество файлов"
        hint="validation.maxFilesCount"
      >
        <UInputNumber
          v-model="element.validation!.maxFilesCount"
          class="w-full"
          :min="1"
        />
      </UFormField>
    </template>

    <USeparator />

    <FormEditorConditionEditor
      v-model="element.visibleIf"
      :available-fields="conditionFields"
    />
  </div>
</template>
