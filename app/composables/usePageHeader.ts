import type { BreadcrumbItem } from '@nuxt/ui'

export function usePageHeader() {
  const breadcrumbs = useState<BreadcrumbItem[]>('page-breadcrumbs', () => [])
  const backTo = useState<string | null>('page-back-to', () => null)

  function setBreadcrumbs(items: BreadcrumbItem[], back?: string | null) {
    breadcrumbs.value = items

    if (back !== undefined) {
      backTo.value = back
      return
    }

    const parent = items[items.length - 2]
    backTo.value = (parent?.to as string | undefined) ?? null
  }

  return { breadcrumbs, backTo, setBreadcrumbs }
}
