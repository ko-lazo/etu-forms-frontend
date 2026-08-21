import type { AiGenerateRequest, AiGenerateResult, AiLimit } from './types'
import { useHttp } from '~/api/http'

export function useAiApi() {
  const http = useHttp()

  return {
    generateFormSchema(formId: string, prompt: string) {
      const body: AiGenerateRequest = { prompt }
      return http.post<AiGenerateResult>(`/forms/${formId}/ai/generate`, body)
    },

    limit() {
      return http.get<AiLimit>('/ai/limit')
    }
  }
}
