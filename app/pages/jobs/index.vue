<script setup lang="ts">
import type { JobListQuery } from '~/features/jobs/api'
import { useJobsApi } from '~/features/jobs/api'
import { JOB_STATUS_REFRESH_MS } from '~/features/jobs/constants'
import { createJobFilters, toJobListQuery } from '~/features/jobs/filters'
import { isJobActive } from '~/features/jobs/status'

definePageMeta({ layout: 'dashboard', middleware: 'auth', title: 'Задачи' })

const PAGE_SIZE = 20

const { setBreadcrumbs } = usePageHeader()
setBreadcrumbs([{ label: 'Задачи', icon: 'i-lucide-history' }])

const jobsApi = useJobsApi()

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

useAutoRefresh(refresh, {
  interval: JOB_STATUS_REFRESH_MS,
  active: () => jobs.value.some(isJobActive)
})
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

    <JobList
      v-else
      v-model:page="page"
      class="mt-8"
      :jobs="jobs"
      :meta="meta"
      @changed="refresh()"
    />
  </UContainer>
</template>
