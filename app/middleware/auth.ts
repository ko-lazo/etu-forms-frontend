import { useAuth } from '~/features/auth/useAuth'

export default defineNuxtRouteMiddleware(() => {
  const { isAuthenticated, initialized } = useAuth()

  if (!initialized.value) {
    return
  }

  if (!isAuthenticated.value) {
    return navigateTo('/auth/login')
  }
})
