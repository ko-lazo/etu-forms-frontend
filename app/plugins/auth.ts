import { useAuth } from '~/features/auth/useAuth'

export default defineNuxtPlugin(async () => {
  const { initialize } = useAuth()

  await initialize()
})
