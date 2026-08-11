export default defineNuxtRouteMiddleware(() => {
  const { isAuthenticated, initialized } = useAuth()

  if (!initialized.value) {
    return
  }

  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
