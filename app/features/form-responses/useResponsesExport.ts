import type { Job } from '~/features/jobs/types'
import { useJobsApi } from '~/features/jobs/api'
import { JOB_STATUS_REFRESH_MS, JOB_STATUS } from '~/features/jobs/constants'
import { toJobErrorMessage, toJobFailureMessage } from '~/features/jobs/error'
import { isJobActive, isJobDownloadable } from '~/features/jobs/status'
import { useJobDownload } from '~/features/jobs/useJobDownload'
import { useFormResponsesApi } from './api'
import { toExportErrorMessage } from './error'

export function useResponsesExport(formId: string) {
  const responsesApi = useFormResponsesApi(formId)
  const jobsApi = useJobsApi()
  const { processingJobId, download } = useJobDownload()
  const toast = useToast()

  const job = ref<Job | null>(null)

  const isStarting = ref(false)
  const isCancelling = ref(false)
  const isExporting = computed(() => isStarting.value || job.value !== null)
  const isDownloading = computed(() => processingJobId.value !== null)
  let isDisposed = false

  onScopeDispose(() => {
    isDisposed = true
  })

  async function start() {
    if (isExporting.value) return
    isStarting.value = true

    try {
      job.value = await responsesApi.startExport()
    } catch (error) {
      toast.add({ title: toExportErrorMessage(error), color: 'error' })
      return
    } finally {
      isStarting.value = false
    }

    await trackJob()
  }

  async function trackJob() {
    try {
      while (job.value && isJobActive(job.value)) {
        await delay(JOB_STATUS_REFRESH_MS)

        if (isDisposed || !job.value) return

        job.value = await jobsApi.get(job.value.id)
      }
    } catch (error) {
      toast.add({ title: toJobErrorMessage(error), color: 'error' })
      reset()
      return
    }

    await finish()
  }

  async function finish() {
    const finished = job.value
    if (!finished) return

    if (isJobDownloadable(finished)) {
      await download(finished)
    } else if (finished.status === JOB_STATUS.SUCCEEDED) {
      toast.add({ title: 'Выгрузка завершилась без файла', color: 'error' })
    } else if (finished.status === JOB_STATUS.FAILED) {
      toast.add({
        title: 'Выгрузка не удалась',
        description: toJobFailureMessage(finished.error),
        color: 'error'
      })
    } else {
      toast.add({ title: 'Выгрузка отменена', color: 'neutral' })
    }
    reset()
  }

  async function cancel() {
    if (!job.value || isCancelling.value) return
    isCancelling.value = true
    try {
      job.value = await jobsApi.cancel(job.value.id)
    } catch (error) {
      toast.add({ title: toJobErrorMessage(error), color: 'error' })
      isCancelling.value = false
    }
  }

  function reset() {
    job.value = null
    isCancelling.value = false
  }

  function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  return {
    job,
    isExporting,
    isDownloading,
    isCancelling,
    start,
    cancel
  }
}
