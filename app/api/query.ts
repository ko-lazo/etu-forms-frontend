import type { FetchContext } from 'ofetch'
import qs from 'qs'

export function applyQuery(context: FetchContext): void {
  const { options } = context

  if (!options.query || typeof context.request !== 'string') {
    return
  }

  const query = qs.stringify(options.query, {
    arrayFormat: 'repeat',
    encodeValuesOnly: true,
    skipNulls: true
  })

  delete options.query

  if (query) {
    context.request += (context.request.includes('?') ? '&' : '?') + query
  }
}
