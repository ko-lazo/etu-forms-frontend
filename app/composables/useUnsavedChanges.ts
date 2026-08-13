import type { Ref } from 'vue'

export function useUnsavedChanges<T>(model: Ref<T>) {
  const serialize = (value: T) => (value ? JSON.stringify(value) : null)

  const snapshot = ref<string | null>(serialize(model.value))

  const isDirty = computed(() => {
    if (snapshot.value === null || !model.value) return false
    return JSON.stringify(model.value) !== snapshot.value
  })

  function markSaved() {
    snapshot.value = serialize(model.value)
  }

  function reset() {
    if (snapshot.value === null) return
    model.value = JSON.parse(snapshot.value) as T
  }

  function onBeforeUnload(event: BeforeUnloadEvent) {
    if (!isDirty.value) return
    event.preventDefault()
  }

  onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
  onUnmounted(() => window.removeEventListener('beforeunload', onBeforeUnload))

  onBeforeRouteLeave(() => {
    if (!isDirty.value) return true
    return confirm('Изменения не сохранены. Покинуть страницу?')
  })

  return { isDirty, markSaved, reset }
}
