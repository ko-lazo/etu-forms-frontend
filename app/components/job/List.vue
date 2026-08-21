<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Schemas } from '~/api/types'
import type { Job } from '~/features/jobs/types'
import { JOB_TYPE_LABEL } from '~/features/jobs/constants'
import { toJobFailureMessage } from '~/features/jobs/error'
import { isJobActive } from '~/features/jobs/status'

defineProps<{
  jobs: Job[]
  meta?: Schemas['PaginationMeta']
}>()

defineEmits<{
  changed: []
}>()

const page = defineModel<number>('page', { required: true })

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
</script>

<template>
  <div>
    <UTable
      :data="jobs"
      :columns="columns"
      class="border border-default rounded-lg overflow-hidden"
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
        <JobActions
          :job="row.original"
          @changed="$emit('changed')"
        />
      </template>
    </UTable>

    <div
      v-if="meta && meta.totalPages > 1"
      class="mt-4 flex justify-end"
    >
      <UPagination
        v-model:page="page"
        :total="meta.total"
        :items-per-page="meta.limit"
      />
    </div>
  </div>
</template>
