<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const router = useRouter()
const { user, logout } = useAuth()
const { breadcrumbs, backTo } = usePageHeader()

const navigation: NavigationMenuItem[] = [
  { label: 'Формы', icon: 'i-lucide-file-text', to: '/forms' },
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

function goBack() {
  if (backTo.value) {
    router.push(backTo.value)
  } else {
    router.back()
  }
}
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
<!--          <AppLogo class="h-5 w-auto shrink-0 text-primary" />-->
          <span
            v-if="!collapsed"
            class="font-semibold truncate"
          >
            etu-forms
          </span>
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
        <UDashboardNavbar>
          <template #leading>
            <UDashboardSidebarCollapse />
            <UButton
              v-if="backTo"
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="ghost"
              size="sm"
              class="ms-1"
              @click="goBack"
            />
          </template>

          <template #title>
            <UBreadcrumb
              v-if="breadcrumbs.length"
              :items="breadcrumbs"
            />
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
