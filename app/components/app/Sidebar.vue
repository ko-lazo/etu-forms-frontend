<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { useAuth } from '~/features/auth/useAuth'

const { user, logout } = useAuth()

const navigation: NavigationMenuItem[] = [
  { label: 'Формы', icon: 'i-lucide-file-text', to: '/forms' },
  { label: 'Задачи', icon: 'i-lucide-history', to: '/jobs' },
  { label: 'API токены', icon: 'i-lucide-key-round', to: '/tokens' }
]

function handleLogout() {
  logout()
  navigateTo('/auth/login')
}

const userMenuItems = [
  {
    label: 'Выйти',
    icon: 'i-lucide-log-out',
    onClick: handleLogout
  }
]
</script>

<template>
  <UDashboardSidebar
    collapsible
    resizable
    :min-size="12"
    :default-size="15"
    :max-size="20"
  >
    <template #header="{ collapsed }">
      <NuxtLink
        to="/"
        class="flex items-center gap-2 overflow-hidden"
      >
        <!--          <AppLogo class="h-5 w-auto shrink-0 text-primary" /> -->
        <span
          v-if="!collapsed"
          class="font-semibold truncate"
        >
          etu-forms
        </span>
      </NuxtLink>
    </template>

    <template #default="{ collapsed }">
      <UDashboardSearchButton
        label="Поиск..."
        :collapsed="collapsed"
        :kbds="['ctrl', 's']"
        tooltip
      />

      <UNavigationMenu
        :items="navigation"
        orientation="vertical"
      />

      <AppSearch />
    </template>

    <template #footer="{ collapsed }">
      <UDropdownMenu
        :items="userMenuItems"
        :content="{ align: 'start' }"
      >
        <UButton
          color="neutral"
          variant="ghost"
          class="w-full"
          :class="collapsed ? 'justify-center' : 'justify-start'"
          icon="i-lucide-user-round"
        >
          <span
            v-if="!collapsed"
            class="truncate"
          >{{ user?.email ?? 'Пользователь' }}</span>
        </UButton>
      </UDropdownMenu>
    </template>
  </UDashboardSidebar>
</template>
