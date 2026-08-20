<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { FormResponse } from '~/features/form-responses/types'
import type { FormResponseListQuery } from '~/features/form-responses/api'
import { useFormsApi } from '~/features/forms/api'
import { useFormResponsesApi } from '~/features/form-responses/api'
import { createResponseFilters, toResponseListQuery } from '~/features/form-responses/filters'

definePageMeta({ layout: 'dashboard', middleware: 'auth', title: 'Ответы' })

const PAGE_SIZE = 20

const route = useRoute()
const formId = route.params.id as string

const { setBreadcrumbs } = usePageHeader()
setBreadcrumbs([{ label: 'Формы', to: '/forms' }, { label: 'Загрузка...', to: `/forms/${formId}/edit` }, { label: 'Ответы' }])

const formsApi = useFormsApi()
const responsesApi = useFormResponsesApi(formId)

const { filters, page, isActive: isFiltered, reset: resetFilters } = useFilters(createResponseFilters)

const selectedResponse = ref<FormResponse | null>(null)
const isDetailsOpen = ref(false)

const { data: form } = await useAsyncData(`form-${formId}-meta`, () => formsApi.get(formId))

watch(form, (value) => {
  if (value) {
    setBreadcrumbs([{ label: 'Формы', to: '/forms' }, { label: value.title, to: `/forms/${formId}/edit` }, { label: 'Ответы' }])
  }
}, { immediate: true })

const listQuery = computed<FormResponseListQuery>(() => ({
  page: page.value,
  limit: PAGE_SIZE,
  ...toResponseListQuery(filters.value)
}))

const { data, status, error, refresh } = await useAsyncData(
  `form-${formId}-responses`,
  () => responsesApi.list(listQuery.value),
  { watch: [listQuery] }
)

const responses = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)

const fields = computed(() => form.value?.schema.pages.flatMap(page => page.elements) ?? [])

const columns = computed<TableColumn<FormResponse>[]>(() => [
  {
    accessorKey: 'submittedAt',
    header: 'Дата отправки',
    cell: ({ row }: { row: TableRow<FormResponse> }) => formatDateTime(row.original.submittedAt)
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

function openDetails(response: FormResponse) {
  selectedResponse.value = response
  isDetailsOpen.value = true
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

    <FormResponseFilters
      v-model="filters"
      class="mt-6"
      :fields="fields"
      :active="isFiltered"
      @reset="resetFilters"
    />

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

    <AppErrorState
      v-else-if="error"
      class="mt-8"
      title="Не удалось загрузить ответы"
      :description="error.message"
      retryable
      @retry="refresh()"
    />

    <AppEmptyState
      v-else-if="responses.length === 0"
      class="mt-16"
      title="Ответов пока нет"
      description="Здесь будут появляться результаты, как только пользователи начнут заполнять форму"
      :filtered="isFiltered"
      @reset="resetFilters"
    />

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
              @click="openDetails(row.original)"
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
          :items-per-page="PAGE_SIZE"
        />
      </div>
    </template>

    <FormResponseDetails
      v-model:open="isDetailsOpen"
      :response="selectedResponse"
      :fields="fields"
    />
  </UContainer>
</template>
