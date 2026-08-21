<script setup lang="ts">
import type { JobStatus } from '~/features/jobs/types'
import { JOB_STATUS_META } from '~/features/jobs/constants'

const props = defineProps<{
  status: JobStatus
}>()

const meta = computed(() => JOB_STATUS_META[props.status])
</script>

<template>
  <UBadge
    :color="meta.color"
    :icon="meta.icon"
    variant="subtle"
  >
    {{ meta.label }}
  </UBadge>
</template>
