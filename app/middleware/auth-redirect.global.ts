import { useAuth } from '~/features/auth/useAuth'

export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuth()

  if (to.path === '/') {
    if (isAuthenticated.value) {
      return navigateTo('/forms')
    }
    return navigateTo('/auth/login')
  }
})
