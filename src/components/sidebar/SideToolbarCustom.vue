<template>
  <teleport :to="'.comfyui-body-left'">
    <nav class="side-tool-bar-container">
      <SidebarIcon
        v-for="tab in tabs"
        :key="tab.id"
        :icon="tab.icon"
        :icon-badge="tab.iconBadge"
        :tooltip="tab.tooltip + getTabTooltipSuffix(tab)"
        :selected="tab.id === selectedTab?.id"
        :class="tab.id + '-tab-button'"
        @click="onTabClick(tab)"
      />
      <div class="side-tool-bar-end">
        <SidebarLogoutIcon v-if="userStore.isMultiUserServer" />
        <SidebarThemeToggleIcon />
        <SidebarSettingsToggleIcon />
      </div>
    </nav>
  </teleport>
  <div
    v-if="selectedTab"
    class="sidebar-content-container h-full overflow-y-auto overflow-x-hidden"
  >
    <ExtensionSlot :extension="selectedTab" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import ExtensionSlot from '@/components/common/ExtensionSlot.vue'
import { useKeybindingStore } from '@/stores/keybindingStore'
import { useUserStore } from '@/stores/userStore'
import { useSidebarTabStore } from '@/stores/workspace/sidebarTabCustomStore'
import type { SidebarTabExtension } from '@/types/extensionTypes'

import SidebarIcon from './SidebarIcon.vue'
import SidebarLogoutIcon from './SidebarLogoutIcon.vue'
import SidebarSettingsToggleIcon from './SidebarSettingsToggleIcon.vue'
import SidebarThemeToggleIcon from './SidebarThemeToggleIcon.vue'

const userStore = useUserStore()
const sidebarTabStore = useSidebarTabStore()

const tabs = computed(() => sidebarTabStore.sidebarTabs)
const selectedTab = computed(() => sidebarTabStore.activeSidebarTab)
const onTabClick = (item: SidebarTabExtension) => {
  sidebarTabStore.toggleSidebarTab(item.id)
}
const keybindingStore = useKeybindingStore()
const getTabTooltipSuffix = (tab: SidebarTabExtension) => {
  const keybinding = keybindingStore.getKeybindingByCommandId(
    `Workspace.ToggleSidebarTab.${tab.id}`
  )
  return keybinding ? ` (${keybinding.combo.toString()})` : ''
}
</script>

<style scoped>
.side-tool-bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;

  width: var(--sidebar-width);
  height: 100%;

  background-color: var(--comfy-menu-secondary-bg);
  color: var(--fg-color);
  box-shadow: var(--bar-shadow);

  --sidebar-width: 4rem;
  --sidebar-icon-size: 1.5rem;
}

.side-tool-bar-container.small-sidebar {
  --sidebar-width: 2.5rem;
  --sidebar-icon-size: 1rem;
}

.side-tool-bar-end {
  align-self: flex-end;
  margin-top: auto;
}
</style>
