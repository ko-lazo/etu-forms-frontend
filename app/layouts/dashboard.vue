<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const { user, logout } = useAuth()

const navigation: NavigationMenuItem[] = [
  { label: 'Формы', icon: 'i-lucide-file-text', to: '/forms' },
  { label: 'API токены', icon: 'i-lucide-key-round', to: '/tokens' }
]

const title = computed(() => (route.meta.title as string | undefined) ?? 'etu-forms')

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
  <UDashboardGroup
    unit="rem"
    class="min-h-screen"
  >
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
          <span
            v-if="!collapsed"
            class="font-semibold truncate"
          >etu-forms</span>
        </NuxtLink>
      </template>

      <UNavigationMenu
        :items="navigation"
        orientation="vertical"
      />

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

    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar :title="title">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>

          <template #right>
            <UColorModeButton />
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <slot />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
