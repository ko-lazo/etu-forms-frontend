<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { JobListQuery } from '~/features/jobs/api'
import type { Job } from '~/features/jobs/types'
import { useJobsApi } from '~/features/jobs/api'
import { JOB_STATUS_REFRESH_MS, JOB_TYPE_LABEL } from '~/features/jobs/constants'
import { toJobErrorMessage, toJobFailureMessage } from '~/features/jobs/error'
import { createJobFilters, toJobListQuery } from '~/features/jobs/filters'
import { isJobActive, isJobDownloadable } from '~/features/jobs/status'
import { useJobDownload } from '~/features/jobs/useJobDownload'

definePageMeta({ layout: 'dashboard', middleware: 'auth', title: 'Задачи' })

const PAGE_SIZE = 20

const { setBreadcrumbs } = usePageHeader()
setBreadcrumbs([{ label: 'Задачи', icon: 'i-lucide-history' }])

const jobsApi = useJobsApi()
const { processingJobId, download } = useJobDownload()
const toast = useToast()

const { filters, page, isActive: isFiltered, reset: resetFilters } = useFilters(createJobFilters)

const listQuery = computed<JobListQuery>(() => ({
  page: page.value,
  limit: PAGE_SIZE,
  ...toJobListQuery(filters.value)
}))

const { data, status, error, refresh } = await useAsyncData(
  'jobs',
  () => jobsApi.list(listQuery.value),
  { watch: [listQuery] }
)

const jobs = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)

const isLoading = computed(() => status.value === 'pending' && !data.value)
const hasActiveJobs = computed(() => jobs.value.some(isJobActive))

let timer: ReturnType<typeof setInterval> | undefined

watch(hasActiveJobs, (active) => {
  clearInterval(timer)

  if (active) {
    timer = setInterval(() => refresh(), JOB_STATUS_REFRESH_MS)
  }
}, { immediate: true })

onBeforeUnmount(() => clearInterval(timer))

const cancellingId = ref<string | null>(null)

const columns: TableColumn<Job>[] = [
  { accessorKey: 'type', header: 'Задача' },
  { accessorKey: 'createdAt', header: 'Создана' },
  { accessorKey: 'status', header: 'Статус' },
  { accessorKey: 'result', header: 'Результат' },
  {
    accessorKey: 'id',
    id: 'actions',
    header: '',
    meta: { class: { th: 'text-right', td: 'text-right' } }
  }
]

function typeLabel(job: Job): string {
  return JOB_TYPE_LABEL[job.type] ?? job.type
}

function resultLabel(job: Job): string {
  const file = job.result?.file

  if (file) return file.name
  if (job.error) return toJobFailureMessage(job.error)

  return EMPTY_VALUE
}

async function cancelJob(job: Job) {
  cancellingId.value = job.id

  try {
    await jobsApi.cancel(job.id)
    toast.add({ title: 'Отмена запрошена', color: 'neutral' })
    await refresh()
  } catch (cancelError) {
    toast.add({ title: toJobErrorMessage(cancelError), color: 'error' })
  } finally {
    cancellingId.value = null
  }
}
</script>

<template>
  <UContainer class="py-8">
    <div>
      <h1 class="text-2xl font-semibold">
        Задачи
      </h1>
      <p class="mt-1 text-sm text-muted">
        Выгрузки ответов выполняются в фоне: страницу можно закрыть и вернуться за файлом позже
      </p>
    </div>

    <JobFilters
      v-model="filters"
      class="mt-6"
      :active="isFiltered"
      @reset="resetFilters"
    />

    <div
      v-if="isLoading"
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
      title="Не удалось загрузить задачи"
      :description="error.message"
      retryable
      @retry="refresh()"
    />

    <AppEmptyState
      v-else-if="jobs.length === 0"
      class="mt-16"
      icon="i-lucide-list-checks"
      title="Задач пока нет"
      description="Здесь появятся выгрузки ответов - их можно поставить в очередь на странице ответов формы"
      :filtered="isFiltered"
      @reset="resetFilters"
    />

    <template v-else>
      <UTable
        :data="jobs"
        :columns="columns"
        class="mt-8 border border-default rounded-lg overflow-hidden"
      >
        <template #type-cell="{ row }">
          <div class="font-medium">
            {{ typeLabel(row.original) }}
          </div>
        </template>

        <template #createdAt-cell="{ row }">
          {{ formatDateTime(row.original.createdAt) }}
        </template>

        <template #status-cell="{ row }">
          <div class="flex flex-col items-start gap-2">
            <JobStatusBadge :status="row.original.status" />

            <JobProgress
              v-if="isJobActive(row.original)"
              :job="row.original"
              class="w-40"
            />
          </div>
        </template>

        <template #result-cell="{ row }">
          <span :class="row.original.error ? 'text-error' : 'text-muted'">
            {{ resultLabel(row.original) }}
          </span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-2">
            <UButton
              v-if="isJobDownloadable(row.original)"
              icon="i-lucide-download"
              color="neutral"
              variant="subtle"
              size="sm"
              :loading="processingJobId === row.original.id"
              @click="download(row.original)"
            >
              Скачать
            </UButton>

            <UButton
              v-if="isJobActive(row.original)"
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="sm"
              :loading="cancellingId === row.original.id"
              @click="cancelJob(row.original)"
            >
              Отменить
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
  </UContainer>
</template>
