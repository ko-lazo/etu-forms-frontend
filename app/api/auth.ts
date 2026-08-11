import type {
  LoginRequest,
  LoginResponse,
  User
} from '~/types/auth'
import { useApi } from '~/api/client.ts'

export function useAuthApi() {
  const api = useApi()

  function login(data: LoginRequest) {
    return api<LoginResponse>('/auth/login', {
      method: 'POST',
      body: data
    })
  }

  function me() {
    return api<User>('/auth/me')
  }

  return {
    login,
    me
  }
}
