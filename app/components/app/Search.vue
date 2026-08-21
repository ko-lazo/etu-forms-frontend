<script setup lang="ts">
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'
import type { Form } from '~/features/forms/types'
import { useFormsApi } from '~/features/forms/api'
import { FORM_STATUS_META } from '~/features/forms/constants'

const SEARCH_LIMIT = 5
const SEARCH_DELAY = 250

const formsApi = useFormsApi()

const open = ref(false)
const searchTerm = ref('')
const forms = ref<Form[]>([])
const loading = ref(false)

let timer: ReturnType<typeof setTimeout> | undefined
let lastRequest = 0

async function searchForms() {
  const request = ++lastRequest
  loading.value = true

  try {
    const result = await formsApi.list({ title: searchTerm.value || undefined, limit: SEARCH_LIMIT })

    if (request === lastRequest) {
      forms.value = result.data
    }
  } catch {
    if (request === lastRequest) {
      forms.value = []
    }
  } finally {
    if (request === lastRequest) {
      loading.value = false
    }
  }
}

watch(searchTerm, () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    if (open.value) {
      searchForms()
    }
  }, SEARCH_DELAY)
})

watch(open, (isOpen) => {
  clearTimeout(timer)
  if (isOpen) {
    searchForms()
  }
})

onBeforeUnmount(() => clearTimeout(timer))

defineShortcuts({
  ctrl_s: {
    usingInput: true,
    handler: () => {
      open.value = !open.value
    }
  }
}, { layoutIndependent: true })

const groups = computed<CommandPaletteGroup<CommandPaletteItem>[]>(() => [
  {
    id: 'forms',
    label: searchTerm.value ? 'Формы' : 'Последние формы',
    ignoreFilter: true,
    items: forms.value.map(form => ({
      label: form.title,
      suffix: FORM_STATUS_META[form.status].label,
      icon: 'i-lucide-file-text',
      to: `/forms/${form.id}/edit`
    }))
  },
  {
    id: 'links',
    label: 'Разделы',
    items: [
      {
        label: 'Задачи',
        icon: 'i-lucide-history',
        to: '/jobs'
      },
      {
        label: 'API токены',
        icon: 'i-lucide-key-round',
        to: '/tokens'
      }
    ]
  }
])
</script>

<template>
  <UDashboardSearch
    v-model:open="open"
    v-model:search-term="searchTerm"
    shortcut=""
    title="Поиск"
    placeholder="Поиск..."
    description="Поиск по формам и разделам кабинета"
    :groups="groups"
    :loading="loading"
  />
</template>
