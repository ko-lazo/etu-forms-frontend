<script setup lang="ts">
import type { FormElement } from '~/types/form/schema/form-schema.schema'
import type { FormResponseAnswerValue } from '~/types/form/response'
import { useFormsApi } from '~/api/form.ts'
import { useFormResponsesApi } from '~/api/form-response.ts'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const formId = route.params.id as string

const formsApi = useFormsApi()
const responsesApi = useFormResponsesApi(formId)

const { data: form, status, error } = await useAsyncData(`public-form-${formId}`, () => formsApi.get(formId))

const answers = reactive<Record<string, FormResponseAnswerValue>>({})
const responseId = ref<string | null>(null)
const submitted = ref(false)
const saveState = ref<'idle' | 'saving' | 'saved'>('idle')

const storageKey = `etu-forms:response:${formId}`

onMounted(async () => {
  const fromQuery = route.query.r as string | undefined
  const fromStorage = localStorage.getItem(storageKey)
  const existingId = fromQuery ?? fromStorage ?? undefined

  if (!existingId) return

  try {
    const existing = await responsesApi.get(existingId)
    if (existing.submittedAt) {
      submitted.value = true
    }
    Object.assign(answers, existing.answers)
    responseId.value = existing.id
    localStorage.setItem(storageKey, existing.id)
  } catch {
    localStorage.removeItem(storageKey)
  }
})

// Visible pages/fields, recomputed as answers change.
const visiblePages = computed(() => {
  if (!form.value) return []

  return form.value.schema.pages
    .filter(page => evaluateCondition(page.visibleIf, answers))
    .map(page => ({
      ...page,
      elements: page.elements.filter(el => evaluateCondition(el.visibleIf, answers))
    }))
})

const visibleFields = computed<FormElement[]>(() => visiblePages.value.flatMap(p => p.elements))

let saveTimeout: ReturnType<typeof setTimeout> | undefined

function scheduleSave() {
  saveState.value = 'saving'
  clearTimeout(saveTimeout)
  saveTimeout = setTimeout(doSave, 800)
}

async function doSave() {
  try {
    const saved = await responsesApi.save({
      id: responseId.value ?? undefined,
      answers: { ...answers },
      metadata: {},
      submittedAt: null
    })
    responseId.value = saved.id
    localStorage.setItem(storageKey, saved.id)

    if (!route.query.r) {
      router.replace({ query: { ...route.query, r: saved.id } })
    }

    saveState.value = 'saved'
  } catch {
    saveState.value = 'idle'
  }
}

function onFieldChange(name: string, value: unknown) {
  answers[name] = value as FormResponseAnswerValue
  scheduleSave()
}

const errors = ref<Record<string, string>>({})

const submitting = ref(false)

async function submit() {
  const missing: Record<string, string> = {}

  for (const field of visibleFields.value) {
    if (field.required) {
      const value = answers[field.name]
      const empty = value === undefined || value === '' || (Array.isArray(value) && value.length === 0)
      if (empty) missing[field.name] = 'Обязательное поле'
    }
  }

  errors.value = missing

  if (Object.keys(missing).length > 0) {
    const firstField = document.getElementById(`field-${Object.keys(missing)[0]}`)
    firstField?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  submitting.value = true
  try {
    await responsesApi.save({
      id: responseId.value ?? undefined,
      answers: { ...answers },
      metadata: {},
      submittedAt: new Date().toISOString()
    })
    submitted.value = true
    localStorage.removeItem(storageKey)
  } finally {
    submitting.value = false
  }
}

const resumeUrl = computed(() => {
  if (!responseId.value || import.meta.server) return ''
  return `${window.location.origin}${route.path}?r=${responseId.value}`
})

const copied = ref(false)

async function copyResumeUrl() {
  if (!resumeUrl.value) return
  await navigator.clipboard.writeText(resumeUrl.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <div class="min-h-screen bg-elevated/30">
    <UContainer class="max-w-2xl py-10">
      <div
        v-if="status === 'pending'"
        class="space-y-4"
      >
        <USkeleton class="h-24 w-full" />
        <USkeleton class="h-40 w-full" />
      </div>

      <UAlert
        v-else-if="error"
        color="error"
        variant="subtle"
        icon="i-lucide-alert-triangle"
        title="Форма не найдена"
        description="Проверьте ссылку или обратитесь к тому, кто её отправил."
      />

      <div
        v-else-if="submitted"
        class="rounded-xl border border-default bg-default p-10 text-center"
      >
        <UIcon
          name="i-lucide-circle-check"
          class="mx-auto size-12 text-primary"
        />
        <h1 class="mt-4 text-xl font-semibold">
          Спасибо! Ваш ответ отправлен
        </h1>
        <p class="mt-1 text-sm text-muted">
          Можно закрыть эту страницу.
        </p>
      </div>

      <template v-else-if="form">
        <div class="overflow-hidden rounded-xl border border-default bg-default">
          <div class="h-2 bg-primary" />
          <div class="p-6">
            <h1 class="text-2xl font-bold">
              {{ form.title }}
            </h1>
          </div>
        </div>

        <div
          v-if="resumeUrl"
          class="mt-4 flex items-center justify-between gap-3 rounded-lg border border-dashed border-default bg-default p-3 text-sm"
        >
          <div class="flex items-center gap-2 text-muted">
            <UIcon
              name="i-lucide-link"
              class="size-4 shrink-0"
            />
            <span>Эта ссылка сохранит ваш прогресс - можно вернуться и продолжить позже</span>
          </div>
          <UButton
            :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
            color="neutral"
            variant="subtle"
            size="sm"
            @click="copyResumeUrl"
          >
            {{ copied ? 'Скопировано' : 'Копировать' }}
          </UButton>
        </div>

        <form
          class="mt-6 space-y-6"
          @submit.prevent="submit"
        >
          <section
            v-for="(page, pageIndex) in visiblePages"
            :key="page.name"
            class="overflow-hidden rounded-xl border border-default bg-default"
          >
            <div class="flex items-center gap-3 border-b border-default bg-elevated/40 px-6 py-3">
              <span class="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-inverted">
                {{ pageIndex + 1 }}
              </span>
              <h2 class="font-semibold">
                {{ page.title || page.name }}
              </h2>
            </div>

            <div
              v-if="page.elements.length === 0"
              class="p-6 text-sm text-muted"
            >
              На этой странице нет полей.
            </div>

            <div
              v-else
              class="space-y-6 p-6"
            >
              <div
                v-for="field in page.elements"
                :id="`field-${field.name}`"
                :key="field.name"
              >
                <FormRuntimeFieldRenderer
                  :element="field"
                  :model-value="answers[field.name]"
                  :error="errors[field.name]"
                  @update:model-value="(v) => onFieldChange(field.name, v)"
                />
              </div>
            </div>
          </section>

          <div class="flex items-center justify-between">
            <p class="text-xs text-muted">
              <template v-if="saveState === 'saving'">
                Сохранение...
              </template>
              <template v-else-if="saveState === 'saved'">
                Черновик сохранён
              </template>
            </p>

            <UButton
              type="submit"
              size="lg"
              icon="i-lucide-send"
              :loading="submitting"
            >
              Отправить
            </UButton>
          </div>
        </form>
      </template>
    </UContainer>
  </div>
</template>
