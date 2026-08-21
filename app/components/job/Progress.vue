<script setup lang="ts">
import type { Job } from '~/features/jobs/types'

const props = defineProps<{
  job: Job
}>()

const caption = computed(() => props.job.totalCount === null
  ? 'Готовим выгрузку...'
  : `${props.job.processedCount} из ${props.job.totalCount}`)
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <UProgress
      :model-value="job.progress"
      size="sm"
    />

    <p class="text-xs text-muted">
      {{ caption }}
    </p>
  </div>
</template>
