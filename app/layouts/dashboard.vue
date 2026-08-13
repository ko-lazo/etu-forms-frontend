<script setup lang="ts">
const router = useRouter()
const { breadcrumbs, backTo } = usePageHeader()

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
    <AppSidebar />

    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar>
          <template #leading>
            <!--            <UDashboardSidebarCollapse /> -->
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
