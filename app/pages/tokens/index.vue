<script setup lang="ts">
import type { ApiTokenCreated } from '~/types/api-token'
import { useApiTokensApi } from '~/api/api-token.ts'

definePageMeta({ layout: 'dashboard', middleware: 'auth', title: 'API токены' })

const { setBreadcrumbs } = usePageHeader()
setBreadcrumbs([{ label: 'API токены', icon: 'i-lucide-key-round' }])

const tokensApi = useApiTokensApi()
const toast = useToast()

const { data, status, error, refresh } = await useAsyncData('api-tokens', () => tokensApi.list())
const tokens = computed(() => data.value?.data ?? [])
const isEmpty = computed(() => status.value === 'success' && tokens.value.length === 0)

const isCreateOpen = ref(false)
const newTokenName = ref('')
const creating = ref(false)
const createdToken = ref<ApiTokenCreated | null>(null)

async function createToken() {
  if (!newTokenName.value.trim()) return

  creating.value = true
  try {
    createdToken.value = await tokensApi.create({ name: newTokenName.value.trim(), expiresAt: null })
    newTokenName.value = ''
    await refresh()
  } catch {
    toast.add({ title: 'Не удалось создать токен', color: 'error' })
  } finally {
    creating.value = false
  }
}

function closeCreateModal() {
  isCreateOpen.value = false
  createdToken.value = null
}

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

const copied = ref(false)

async function copy(text: string) {
  await navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString('ru-RU') : '—'
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

    <UAlert
      v-else-if="error"
      class="mt-8"
      color="error"
      variant="subtle"
      icon="i-lucide-alert-triangle"
      title="Не удалось загрузить токены"
      :description="error.message"
    >
      <template #actions>
        <UButton
          size="sm"
          color="error"
          variant="subtle"
          @click="refresh()"
        >
          Повторить
        </UButton>
      </template>
    </UAlert>

    <div
      v-else-if="isEmpty"
      class="mt-16 flex flex-col items-center gap-3 text-center"
    >
      <UIcon
        name="i-lucide-key-round"
        class="size-10 text-muted"
      />
      <p class="text-lg font-medium">
        Токенов пока нет
      </p>
      <p class="max-w-sm text-sm text-muted">
        Создайте токен, чтобы обращаться к API от имени вашего аккаунта.
      </p>
      <UButton
        icon="i-lucide-plus"
        @click="isCreateOpen = true"
      >
        Создать токен
      </UButton>
    </div>

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
            Создан {{ formatDate(token.createdAt) }} ·
            последнее использование: {{ formatDate(token.lastUsedAt) }}
            <template v-if="token.expiresAt">
              · истекает {{ formatDate(token.expiresAt) }}
            </template>
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

    <UModal
      v-model:open="isCreateOpen"
      title="Новый API токен"
      @update:open="(v) => !v && closeCreateModal()"
    >
      <template #body>
        <div
          v-if="!createdToken"
          class="space-y-4"
        >
          <UFormField
            label="Название"
            required
          >
            <UInput
              v-model="newTokenName"
              placeholder="Например, Корпоративный сайт"
              class="w-full"
              @keyup.enter="createToken"
            />
          </UFormField>
        </div>

        <div
          v-else
          class="space-y-3"
        >
          <UAlert
            color="warning"
            variant="subtle"
            icon="i-lucide-triangle-alert"
            title="Скопируйте токен сейчас — он больше не будет показан"
          />

          <div class="flex items-center gap-2 rounded-lg border border-default bg-elevated/50 p-3">
            <code class="flex-1 truncate text-sm">{{ createdToken.token }}</code>
            <UButton
              :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="copy(createdToken.token)"
            />
          </div>
        </div>
      </template>

      <template #footer>
        <template v-if="!createdToken">
          <UButton
            color="neutral"
            variant="ghost"
            @click="isCreateOpen = false"
          >
            Отмена
          </UButton>
          <UButton
            :loading="creating"
            @click="createToken"
          >
            Создать
          </UButton>
        </template>
        <UButton
          v-else
          @click="closeCreateModal"
        >
          Готово
        </UButton>
      </template>
    </UModal>
  </UContainer>
</template>
