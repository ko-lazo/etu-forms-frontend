import type { Job } from './types'
import { useJobsApi } from './api'
import { EXPORT_FILE_NAME } from './constants'
import { toJobErrorMessage } from './error'

export function useJobDownload() {
  const api = useJobsApi()
  const toast = useToast()

  const processingJobId = ref<string | null>(null)

  async function download(job: Job): Promise<boolean> {
    processingJobId.value = job.id

    try {
      const file = await api.downloadResult(job.id)

      downloadBlob(file, job.result?.file?.name ?? EXPORT_FILE_NAME)

      return true
    } catch (error) {
      toast.add({ title: toJobErrorMessage(error), color: 'error' })

      return false
    } finally {
      processingJobId.value = null
    }
  }

  return {
    processingJobId,
    download
  }
}
