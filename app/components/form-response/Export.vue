<script setup lang="ts">
import { useResponsesExport } from '~/features/form-responses/useResponsesExport'

const props = defineProps<{
  formId: string
}>()

const { job, isExporting, isDownloading, isCancelling, start, cancel } = useResponsesExport(props.formId)
</script>

<template>
  <UButton
    v-if="!job"
    icon="i-lucide-download"
    color="neutral"
    variant="subtle"
    :loading="isExporting"
    @click="start"
  >
    Выгрузить в XLSX
  </UButton>

  <div
    v-else
    class="flex items-center gap-3"
  >
    <UTooltip text="Задача выполняется: вы можете просмотреть статус в любой момент в разделе «Задачи»">
      <JobProgress
        :job="job"
        class="w-44"
      />
    </UTooltip>

    <UButton
      icon="i-lucide-x"
      size="sm"
      color="neutral"
      variant="ghost"
      :disabled="isCancelling || isDownloading"
      @click="cancel"
    >
      Отменить
    </UButton>
  </div>
</template>
