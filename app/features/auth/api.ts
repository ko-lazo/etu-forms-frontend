import type { IssuedToken, LoginRequest, User } from './types'
import { useHttp } from '~/api/http'

export function useAuthApi() {
  const http = useHttp()

  return {
    login(data: LoginRequest) {
      return http.post<IssuedToken>('/auth/login', data)
    },

    me() {
      return http.get<User>('/auth/me')
    }
  }
}
