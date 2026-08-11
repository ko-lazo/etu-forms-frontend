<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import type { Condition, ConditionOperator, ConditionRule } from '~/types/form/schema/condition.schema'
import type { FormElement } from '~/types/form/schema/form-schema.schema'

const props = defineProps<{
  modelValue: Condition | undefined
  availableFields: FormElement[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Condition | undefined]
}>()

const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  equals: 'равно',
  notEquals: 'не равно',
  greaterThan: 'больше',
  greaterThanOrEqual: 'больше или равно',
  lessThan: 'меньше',
  lessThanOrEqual: 'меньше или равно',
  contains: 'содержит',
  notContains: 'не содержит',
  empty: 'пусто',
  notEmpty: 'не пусто'
}

const operatorItems: SelectItem[] = Object.entries(OPERATOR_LABELS).map(([value, label]) => ({ label, value }))

const fieldItems = computed<SelectItem[]>(() =>
  props.availableFields.map(field => ({ label: field.label, value: field.name }))
)

const enabled = computed(() => props.modelValue !== undefined)
const combinator = ref<'and' | 'or'>('and')
const rules = ref<ConditionRule[]>([])

watch(() => props.modelValue, (value) => {
  if (!value) {
    rules.value = []
    return
  }

  if ('and' in value) {
    combinator.value = 'and'
    rules.value = value.and.filter((c): c is ConditionRule => 'field' in c)
  } else if ('or' in value) {
    combinator.value = 'or'
    rules.value = value.or.filter((c): c is ConditionRule => 'field' in c)
  } else {
    combinator.value = 'and'
    rules.value = [value]
  }
}, { immediate: true })

function emitChange() {
  if (rules.value.length === 0) {
    emit('update:modelValue', undefined)
    return
  }

  if (rules.value.length === 1) {
    emit('update:modelValue', rules.value[0])
    return
  }

  emit('update:modelValue', combinator.value === 'and' ? { and: rules.value } : { or: rules.value })
}

function enable() {
  const firstField = props.availableFields[0]
  if (!firstField) return
  rules.value = [{ field: firstField.name, operator: 'equals', value: '' }]
  emitChange()
}

function disable() {
  rules.value = []
  emit('update:modelValue', undefined)
}

function addRule() {
  const firstField = props.availableFields[0]
  if (!firstField) return
  rules.value.push({ field: firstField.name, operator: 'equals', value: '' })
  emitChange()
}

function removeRule(index: number) {
  rules.value.splice(index, 1)
  emitChange()
}

function choicesFor(fieldName: string) {
  const field = props.availableFields.find(f => f.name === fieldName)
  return field && 'choices' in field ? field.choices : null
}

function needsValue(operator: ConditionOperator) {
  return operator !== 'empty' && operator !== 'notEmpty'
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <p class="text-sm font-medium">
        Условие показа
      </p>
      <USwitch
        :model-value="enabled"
        :disabled="availableFields.length === 0"
        @update:model-value="(v: boolean) => v ? enable() : disable()"
      />
    </div>

    <p
      v-if="availableFields.length === 0"
      class="text-xs text-muted"
    >
      Добавьте другие поля на форму, чтобы настроить условие показа.
    </p>

    <template v-if="enabled">
      <div
        v-for="(rule, index) in rules"
        :key="index"
        class="space-y-2 rounded-lg border border-default p-3"
      >
        <div class="flex items-center justify-between gap-2">
          <USelect
            v-if="index > 0"
            v-model="combinator"
            :items="[{ label: 'И (все условия)', value: 'and' }, { label: 'ИЛИ (любое условие)', value: 'or' }]"
            size="sm"
            class="w-44"
            @update:model-value="emitChange"
          />
          <span
            v-else
            class="text-xs text-muted"
          >Показывать, если</span>

          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="xs"
            @click="removeRule(index)"
          />
        </div>

        <div class="grid grid-cols-2 gap-2">
          <USelect
            v-model="rule.field"
            :items="fieldItems"
            placeholder="Поле"
            @update:model-value="emitChange"
          />
          <USelect
            v-model="rule.operator"
            :items="operatorItems"
            placeholder="Условие"
            @update:model-value="emitChange"
          />
        </div>

        <!--   todo refactor     -->
        <USelectMenu
          v-if="needsValue(rule.operator) && choicesFor(rule.field)"
          v-model="(rule as any).value"
          value-key="value"
          :items="choicesFor(rule.field)!.map(c => ({ label: c.text, value: c.value }))"
          placeholder="Значение"
          @update:model-value="emitChange"
        />
        <UInput
          v-else-if="needsValue(rule.operator)"
          v-model="(rule as any).value"
          placeholder="Значение"
          @update:model-value="emitChange"
        />
      </div>

      <UButton
        icon="i-lucide-plus"
        color="neutral"
        variant="subtle"
        size="sm"
        @click="addRule"
      >
        Добавить условие
      </UButton>
    </template>
  </div>
</template>
