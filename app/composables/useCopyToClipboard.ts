const RESET_DELAY = 2000

export function useCopyToClipboard(resetDelay = RESET_DELAY) {
  const copied = ref(false)

  let timeout: ReturnType<typeof setTimeout> | undefined

  async function copy(text: string) {
    if (!text) return

    await navigator.clipboard.writeText(text)

    copied.value = true
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      copied.value = false
    }, resetDelay)
  }

  onUnmounted(() => clearTimeout(timeout))

  return { copied, copy }
}
