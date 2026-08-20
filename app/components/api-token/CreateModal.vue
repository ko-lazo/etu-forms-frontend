<script setup lang="ts">
import type { IssuedApiToken } from '~/features/api-tokens/types'
import { useApiTokensApi } from '~/features/api-tokens/api'

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  created: []
}>()

const tokensApi = useApiTokensApi()
const toast = useToast()
const { copied, copy } = useCopyToClipboard()

const name = ref('')

const expiresOn = ref('')

const creating = ref(false)
const issued = ref<IssuedApiToken | null>(null)

const minExpiresOn = computed(() => new Date().toISOString().slice(0, 10))

function toExpiresAt(): string | null {
  if (!expiresOn.value) return null
  return new Date(expiresOn.value).toISOString()
}

async function create() {
  if (!name.value.trim()) return

  creating.value = true
  try {
    issued.value = await tokensApi.create({
      name: name.value.trim(),
      expiresAt: toExpiresAt()
    })

    emit('created')
  } catch {
    toast.add({ title: 'Не удалось создать токен', color: 'error' })
  } finally {
    creating.value = false
  }
}

function close() {
  open.value = false
  issued.value = null
  name.value = ''
  expiresOn.value = ''
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Новый API токен"
    @update:open="(value) => !value && close()"
  >
    <template #body>
      <div
        v-if="!issued"
        class="space-y-4"
      >
        <UFormField
          label="Название"
          required
        >
          <UInput
            v-model="name"
            placeholder="Например, Корпоративный сайт"
            class="w-full"
            @keyup.enter="create"
          />
        </UFormField>

        <UFormField
          label="Действует до"
          help="Оставьте пустым, чтобы токен был бессрочным"
        >
          <UInput
            v-model="expiresOn"
            type="date"
            :min="minExpiresOn"
            class="w-full"
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
          title="Скопируйте токен сейчас - он больше не будет показан"
        />

        <div class="flex items-center gap-2 rounded-lg border border-default bg-elevated/50 p-3">
          <code class="flex-1 truncate text-sm">{{ issued.token }}</code>
          <UButton
            :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="copy(issued.token)"
          />
        </div>
      </div>
    </template>

    <template #footer>
      <template v-if="!issued">
        <UButton
          color="neutral"
          variant="ghost"
          @click="close"
        >
          Отмена
        </UButton>
        <UButton
          :loading="creating"
          @click="create"
        >
          Создать
        </UButton>
      </template>
      <UButton
        v-else
        @click="close"
      >
        Готово
      </UButton>
    </template>
  </UModal>
</template>
