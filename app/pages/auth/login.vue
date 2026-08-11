<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'

const { login } = useAuth()

interface LoginFormState {
  email: string
  password: string
}

const loading = ref(false)
const error = ref<string | null>(null)

async function submit(
  event: FormSubmitEvent<LoginFormState>
) {
  error.value = null
  loading.value = true

  try {
    await login(event.data)

    await navigateTo('/forms')
  } catch (err) {
    error.value = err instanceof Error
      ? err.message
      : 'Не удалось выполнить вход'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 text-lg font-semibold"
        >
          <div class="flex size-9 items-center justify-center rounded-lg bg-primary text-white">
            <UIcon
              name="i-lucide-panels-top-left"
              class="size-5"
            />
          </div>

          <span>etu-forms</span>
        </NuxtLink>
      </div>

      <UAuthForm
        title="Добро пожаловать"
        description="Вход в систему управления формами"
        :fields="[
          {
            name: 'email',
            type: 'email',
            label: 'Email',
            placeholder: 'you@example.com',
            required: true,
            autocomplete: 'email'
          },
          {
            name: 'password',
            type: 'password',
            label: 'Пароль',
            placeholder: 'Введите пароль',
            required: true,
            autocomplete: 'current-password'
          }
        ]"
        :loading="loading"
        :disabled="loading"
        :submit="{
          label: 'Войти'
        }"
        @submit="submit"
      />

      <UAlert
        v-if="error"
        class="mt-4"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        :description="error"
      />
    </div>
  </div>
</template>
