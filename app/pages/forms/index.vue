<script setup lang="ts">
import type { Form } from '~/features/forms/types'
import { useFormsApi } from '~/features/forms/api'
import { FORM_STATUS_META } from '~/features/forms/constants'

definePageMeta({ layout: 'dashboard', middleware: 'auth', title: 'Формы' })

const { setBreadcrumbs } = usePageHeader()
setBreadcrumbs([{ label: 'Формы', icon: 'i-lucide-file-text' }])

const formsApi = useFormsApi()

const { data, status, error, refresh } = await useAsyncData(
  'forms-list',
  () => formsApi.list({ limit: 20 })
)

const forms = computed(() => data.value?.data ?? [])
const isEmpty = computed(() => status.value === 'success' && forms.value.length === 0)

const toast = useToast()
const removing = ref<string | null>(null)

async function removeForm(form: Form) {
  removing.value = form.id
  try {
    await formsApi.remove(form.id)
    toast.add({ title: `Форма "${form.title}" удалена`, color: 'success' })
    await refresh()
  } catch {
    toast.add({ title: 'Не удалось удалить форму', color: 'error' })
  } finally {
    removing.value = null
  }
}

function fieldsCount(form: Form): number {
  return form.schema.pages.reduce((sum, page) => sum + page.elements.length, 0)
}
</script>

<template>
  <UContainer class="py-8">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold">
          Формы
        </h1>
        <p class="mt-1 text-sm text-neutral-500">
          Создавайте формы, публикуйте опросы и собирайте ответы.
        </p>
      </div>

      <UButton
        to="/forms/create"
        icon="i-lucide-plus"
      >
        Добавить
      </UButton>
    </div>

    <div
      v-if="status === 'pending'"
      class="mt-8 space-y-3"
    >
      <USkeleton
        v-for="i in 4"
        :key="i"
        class="h-16 w-full"
      />
    </div>

    <AppErrorState
      v-else-if="error"
      class="mt-8"
      title="Не удалось загрузить формы"
      :description="error.message"
      retryable
      @retry="refresh()"
    />

    <AppEmptyState
      v-else-if="isEmpty"
      class="mt-16"
      icon="i-lucide-file-text"
      title="Форм пока нет"
      description="Создайте свою первую форму"
    >
      <UButton
        to="/forms/create"
        icon="i-lucide-plus"
        class="mt-2"
      >
        Создать форму
      </UButton>
    </AppEmptyState>

    <ul
      v-else
      class="mt-8 divide-y divide-neutral-200/50 dark:divide-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden"
    >
      <li
        v-for="form in forms"
        :key="form.id"
        class="flex items-center justify-between gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
      >
        <NuxtLink
          :to="`/forms/${form.id}/edit`"
          class="min-w-0 flex-1"
        >
          <div class="flex items-center gap-2">
            <p class="truncate font-medium">
              {{ form.title }}
            </p>
            <UBadge
              :color="FORM_STATUS_META[form.status].color"
              variant="subtle"
              size="sm"
            >
              {{ FORM_STATUS_META[form.status].label }}
            </UBadge>
          </div>
          <p class="mt-0.5 text-sm text-neutral-500">
            {{ fieldsCount(form) }} {{ pluralize(fieldsCount(form), ['поле', 'поля', 'полей']) }} ·
            {{ form.schema.pages.length }} {{ pluralize(form.schema.pages.length, ['страница', 'страницы', 'страниц']) }}
          </p>
        </NuxtLink>

        <div class="flex shrink-0 items-center gap-1">
          <UButton
            :to="`/forms/${form.id}/responses`"
            icon="i-lucide-inbox"
            color="neutral"
            variant="ghost"
            size="sm"
          >
            Ответы
          </UButton>

          <UButton
            :to="`/forms/${form.id}/edit`"
            icon="i-lucide-pencil"
            color="neutral"
            variant="ghost"
            size="sm"
          />

          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            :loading="removing === form.id"
            @click="removeForm(form)"
          />
        </div>
      </li>
    </ul>
  </UContainer>
</template>
