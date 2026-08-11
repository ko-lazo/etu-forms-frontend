<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { FormResponse } from '~/types/form/response'
import { useFormsApi } from '~/api/form.ts'
import { useFormResponsesApi } from '~/api/form-response.ts'

definePageMeta({ layout: 'dashboard', middleware: 'auth', title: 'Ответы' })

const route = useRoute()
const formId = route.params.id as string

const { setBreadcrumbs } = usePageHeader()
setBreadcrumbs([{ label: 'Формы', to: '/forms' }, { label: 'Загрузка...', to: `/forms/${formId}/edit` }, { label: 'Ответы' }])

const formsApi = useFormsApi()
const responsesApi = useFormResponsesApi(formId)

const page = ref(1)
const limit = 20
const submissionFilter = ref<'all' | 'submitted' | 'draft'>('all')

const selectedResponse = ref<FormResponse | null>(null)
const isSlideoverOpen = ref(false)

const { data: form } = await useAsyncData(`form-${formId}-meta`, () => formsApi.get(formId))

watch(form, (value) => {
  if (value) {
    setBreadcrumbs([{ label: 'Формы', to: '/forms' }, { label: value.title, to: `/forms/${formId}/edit` }, { label: 'Ответы' }])
  }
}, { immediate: true })

const { data, status, error, refresh } = await useAsyncData(
  `form-${formId}-responses-${page.value}`,
  () => responsesApi.list({ page: page.value, limit }),
  { watch: [page] }
)

const responses = computed(() => {
  const all = data.value?.data ?? []
  if (submissionFilter.value === 'submitted') return all.filter(r => r.submittedAt)
  if (submissionFilter.value === 'draft') return all.filter(r => !r.submittedAt)
  return all
})
const meta = computed(() => data.value?.meta)

const allFields = computed(() => {
  if (!form.value) return []
  return form.value.schema.pages.flatMap(p => p.elements)
})

const columns = computed<TableColumn<FormResponse>[]>(() => [
  {
    accessorKey: 'submittedAt',
    header: 'Дата отправки',
    cell: ({ row }: { row: TableRow<FormResponse> }) => {
      const value = row.original.submittedAt
      return value ? new Date(value).toLocaleString('ru-RU') : '—'
    }
  },
  {
    accessorKey: 'id',
    header: 'ID ответа'
  },
  {
    accessorKey: 'id',
    id: 'actions',
    header: '',
    meta: {
      class: {
        th: 'text-right',
        td: 'text-right'
      }
    }
  }
])

function formatAnswer(value: unknown): string {
  if (value === undefined || value === null || value === '') return '—'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет'
  return String(value)
}

function openResponseDetails(response: FormResponse) {
  selectedResponse.value = response
  isSlideoverOpen.value = true
}
</script>

<template>
  <UContainer class="py-8">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold">
          Ответы на форму
        </h1>
        <p class="mt-1 text-sm text-neutral-500">
          {{ form?.title ?? 'Загрузка...' }}
        </p>
      </div>

      <UButton
        :to="`/forms/${formId}/edit`"
        icon="i-lucide-pencil"
        color="neutral"
        variant="ghost"
      >
        Редактировать форму
      </UButton>
    </div>

    <div class="mt-6">
      <USelect
        v-model="submissionFilter"
        class="w-52"
        :items="[
          { label: 'Все ответы', value: 'all' },
          { label: 'Только отправленные', value: 'submitted' },
          { label: 'Только черновики', value: 'draft' }
        ]"
      />
    </div>

    <div
      v-if="status === 'pending'"
      class="mt-8 space-y-3"
    >
      <USkeleton
        v-for="i in 5"
        :key="i"
        class="h-11 w-full"
      />
    </div>

    <UAlert
      v-else-if="error"
      class="mt-8"
      color="error"
      variant="subtle"
      icon="i-lucide-alert-triangle"
      title="Не удалось загрузить ответы"
      :description="error.message"
    >
      <template #actions>
        <UButton
          size="sm"
          color="error"
          variant="subtle"
          @click="refresh()"
        >
          Повторить
        </UButton>
      </template>
    </UAlert>

    <div
      v-else-if="responses.length === 0"
      class="mt-16 flex flex-col items-center gap-3 text-center"
    >
      <UIcon
        name="i-lucide-inbox"
        class="size-10 text-neutral-400"
      />
      <p class="text-lg font-medium">
        Ответов пока нет
      </p>
      <p class="max-w-sm text-sm text-neutral-500">
        Здесь будут появляться результаты, как только пользователи начнут заполнять форму.
      </p>
    </div>

    <template v-else>
      <UTable
        :data="responses"
        :columns="columns"
        class="mt-8 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden"
      >
        <template #actions-cell="{ row }">
          <div class="text-right">
            <UButton
              color="neutral"
              variant="subtle"
              size="sm"
              icon="i-lucide-eye"
              @click="openResponseDetails(row.original)"
            >
              Смотреть
            </UButton>
          </div>
        </template>
      </UTable>

      <div
        v-if="meta && meta.totalPages > 1"
        class="mt-4 flex justify-end"
      >
        <UPagination
          v-model:page="page"
          :total="meta.total"
          :items-per-page="limit"
        />
      </div>
    </template>

    <USlideover
      v-model:open="isSlideoverOpen"
      title="Детали ответа"
      description="Полный список заполненных полей пользователя"
    >
      <template #body>
        <div
          v-if="selectedResponse"
          class="space-y-6"
        >
          <div class="bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg text-xs text-neutral-500 space-y-1">
            <p><strong>ID ответа:</strong> {{ selectedResponse.id }}</p>
            <p><strong>Отправлено:</strong> {{ selectedResponse.submittedAt ? new Date(selectedResponse.submittedAt).toLocaleString('ru-RU') : '—' }}</p>
          </div>

          <div class="space-y-4 divide-y divide-neutral-100 dark:divide-neutral-800">
            <div
              v-for="field in allFields"
              :key="field.name"
              class="pt-3 first:pt-0"
            >
              <p class="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                {{ field.label }}
              </p>
              <p class="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100 break-words">
                {{ formatAnswer(selectedResponse.answers[field.name]) }}
              </p>
            </div>
          </div>
        </div>
      </template>
    </USlideover>
  </UContainer>
</template>
