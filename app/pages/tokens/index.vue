<script setup lang="ts">
import { useApiTokensApi } from '~/features/api-tokens/api'

definePageMeta({ layout: 'dashboard', middleware: 'auth', title: 'API токены' })

const { setBreadcrumbs } = usePageHeader()
setBreadcrumbs([{ label: 'API токены', icon: 'i-lucide-key-round' }])

const tokensApi = useApiTokensApi()
const toast = useToast()

const { data, status, error, refresh } = await useAsyncData('api-tokens', () => tokensApi.list())
const tokens = computed(() => data.value?.data ?? [])
const isEmpty = computed(() => status.value === 'success' && tokens.value.length === 0)

const isCreateOpen = ref(false)
const removing = ref<string | null>(null)

async function removeToken(id: string) {
  removing.value = id
  try {
    await tokensApi.remove(id)
    toast.add({ title: 'Токен удалён', color: 'success' })
    await refresh()
  } catch {
    toast.add({ title: 'Не удалось удалить токен', color: 'error' })
  } finally {
    removing.value = null
  }
}
</script>

<template>
  <UContainer class="py-8">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold">
          API токены
        </h1>
        <p class="mt-1 text-sm text-muted">
          Используются для доступа к API от имени вашего аккаунта.
        </p>
      </div>

      <UButton
        icon="i-lucide-plus"
        @click="isCreateOpen = true"
      >
        Создать токен
      </UButton>
    </div>

    <div
      v-if="status === 'pending'"
      class="mt-8 space-y-3"
    >
      <USkeleton
        v-for="i in 3"
        :key="i"
        class="h-14 w-full"
      />
    </div>

    <AppErrorState
      v-else-if="error"
      class="mt-8"
      title="Не удалось загрузить токены"
      :description="error.message"
      retryable
      @retry="refresh()"
    />

    <AppEmptyState
      v-else-if="isEmpty"
      class="mt-16"
      icon="i-lucide-key-round"
      title="Токенов пока нет"
      description="Создайте токен, чтобы обращаться к API"
    >
      <UButton
        icon="i-lucide-plus"
        @click="isCreateOpen = true"
      >
        Создать токен
      </UButton>
    </AppEmptyState>

    <ul
      v-else
      class="mt-8 divide-y divide-default rounded-lg border border-default"
    >
      <li
        v-for="token in tokens"
        :key="token.id"
        class="flex items-center justify-between gap-4 p-4"
      >
        <div class="min-w-0 flex-1">
          <p class="truncate font-medium">
            {{ token.name }}
          </p>
          <p class="mt-0.5 text-sm text-muted">
            Создан {{ formatDateTime(token.createdAt) }} ·
            {{ token.expiresAt ? `действует до ${formatDateTime(token.expiresAt)}` : 'бессрочный' }}
          </p>
        </div>

        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          size="sm"
          :loading="removing === token.id"
          @click="removeToken(token.id)"
        />
      </li>
    </ul>

    <ApiTokenCreateModal
      v-model:open="isCreateOpen"
      @created="refresh()"
    />
  </UContainer>
</template>
