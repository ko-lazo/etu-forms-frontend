import type { Ref } from 'vue'

interface Filters<TFilters> {
  filters: Ref<TFilters>
  page: Ref<number>
  isActive: Ref<boolean>
  reset: () => void
}

export function useFilters<TFilters extends object>(
  createFilters: () => TFilters
): Filters<TFilters> {
  const filters = ref(createFilters()) as Ref<TFilters>
  const page = ref(1)

  const initial = JSON.stringify(createFilters())
  const isActive = computed(() => JSON.stringify(filters.value) !== initial)

  watch(filters, () => {
    page.value = 1
  }, { deep: true })

  function reset() {
    filters.value = createFilters()
  }

  return { filters, page, isActive, reset }
}
