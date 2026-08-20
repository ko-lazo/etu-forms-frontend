export function toDayStart(day: string): string | undefined {
  if (!day) return undefined

  const date = new Date(day)
  date.setHours(0, 0, 0, 0)

  return date.toISOString()
}

export function toDayEnd(day: string): string | undefined {
  if (!day) return undefined

  const date = new Date(day)
  date.setDate(date.getDate() + 1)
  date.setHours(0, 0, 0, 0)

  return date.toISOString()
}
