import type { MaybeRefOrGetter } from 'vue'

interface AutoRefreshOptions {
  interval: number
  active: MaybeRefOrGetter<boolean>
}

export function useAutoRefresh(refresh: () => unknown, options: AutoRefreshOptions): void {
  let timer: ReturnType<typeof setInterval> | undefined

  function stop() {
    clearInterval(timer)
    timer = undefined
  }

  watch(() => toValue(options.active), (active) => {
    stop()
    if (active) {
      timer = setInterval(refresh, options.interval)
    }
  }, { immediate: true })

  onScopeDispose(stop)
}
