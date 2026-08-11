export function pluralize(count: number, words: [string, string, string]): string {
  const pr = new Intl.PluralRules('ru-RU')
  const rule = pr.select(count)

  if (rule === 'one') return words[0]
  if (rule === 'few') return words[1]
  return words[2]
}
