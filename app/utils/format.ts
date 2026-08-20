export const EMPTY_VALUE = '-'

export function formatDateTime(value: string | null | undefined): string {
  return value ? new Date(value).toLocaleString('ru-RU') : EMPTY_VALUE
}
