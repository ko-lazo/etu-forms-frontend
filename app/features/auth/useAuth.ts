import type { LoginRequest, User } from './types'
import { useAuthApi } from './api'
import { authToken } from './token'

export function useAuth() {
  const authApi = useAuthApi()

  const user = useState<User | null>(
    'auth.user',
    () => null
  )

  const initialized = useState(
    'auth.initialized',
    () => false
  )

  const isAuthenticated = computed(() => {
    return Boolean(authToken.value && user.value)
  })

  async function login(credentials: LoginRequest) {
    const response = await authApi.login(credentials)
    authToken.value = response.token
    user.value = await authApi.me()
  }

  async function initialize() {
    if (!authToken.value) {
      initialized.value = true
      return
    }

    try {
      user.value = await authApi.me()
    } catch {
      authToken.value = null
      user.value = null
    } finally {
      initialized.value = true
    }
  }

  function logout() {
    authToken.value = null
    user.value = null
  }

  return {
    user: readonly(user),
    initialized: readonly(initialized),
    isAuthenticated,
    login,
    logout,
    initialize
  }
}
