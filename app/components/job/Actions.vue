<script setup lang="ts">
import type { Job } from '~/features/jobs/types'
import { useJobsApi } from '~/features/jobs/api'
import { toJobErrorMessage } from '~/features/jobs/error'
import { isJobActive, isJobDownloadable } from '~/features/jobs/status'
import { useJobDownload } from '~/features/jobs/useJobDownload'

const props = defineProps<{
  job: Job
}>()

const emit = defineEmits<{
  changed: []
}>()

const jobsApi = useJobsApi()
const { processingJobId, download } = useJobDownload()
const toast = useToast()

const cancelling = ref(false)

async function cancel() {
  cancelling.value = true

  try {
    await jobsApi.cancel(props.job.id)
    toast.add({ title: 'Отмена запрошена', color: 'neutral' })
    emit('changed')
  } catch (error) {
    toast.add({ title: toJobErrorMessage(error), color: 'error' })
  } finally {
    cancelling.value = false
  }
}
</script>

<template>
  <div class="flex justify-end gap-2">
    <UButton
      v-if="isJobDownloadable(job)"
      icon="i-lucide-download"
      color="neutral"
      variant="subtle"
      size="sm"
      :loading="processingJobId === job.id"
      @click="download(job)"
    >
      Скачать
    </UButton>

    <UButton
      v-if="isJobActive(job)"
      icon="i-lucide-x"
      color="neutral"
      variant="ghost"
      size="sm"
      :loading="cancelling"
      @click="cancel"
    >
      Отменить
    </UButton>
  </div>
</template>
