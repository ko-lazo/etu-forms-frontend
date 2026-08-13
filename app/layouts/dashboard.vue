<template>
  <UDashboardGroup
    unit="rem"
    class="min-h-screen"
  >
    <AppSidebar />

    <UDashboardPanel>
      <template #header>
        <AppNavbar />
      </template>

      <template #body>
        <slot />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
