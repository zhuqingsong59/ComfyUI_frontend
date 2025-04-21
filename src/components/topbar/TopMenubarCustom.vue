<template>
  <div
    v-show="showTopMenu"
    ref="topMenuRef"
    class="comfyui-menu flex items-center"
  >
    <CommandMenubarCustom />
    <CommandMenubar />
    <div class="flex-grow min-w-0 app-drag h-full">
      <div style="width: 100%; text-align: center">中间区域</div>
    </div>
    <div ref="menuRight" class="comfyui-menu-right flex-shrink-0" />
    <Actionbar />
    <div
      v-show="menuSetting !== 'Bottom'"
      class="window-actions-spacer flex-shrink-0"
    />
  </div>

  <!-- Virtual top menu for native window (drag handle) -->
  <div
    v-show="isNativeWindow() && !showTopMenu"
    class="fixed top-0 left-0 app-drag w-full h-[var(--comfy-topbar-height)]"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import Actionbar from '@/components/actionbar/ComfyActionbarCustom.vue'
import CommandMenubar from '@/components/topbar/CommandMenubar.vue'
import CommandMenubarCustom from '@/components/topbar/CommandMenubarCustom.vue'
import { app } from '@/scripts/app'
import { useSettingStore } from '@/stores/settingStore'
import { electronAPI, isElectron, isNativeWindow } from '@/utils/envUtil'

// const workspaceState = useWorkspaceStore()
const settingStore = useSettingStore()
const menuSetting = computed(() => settingStore.get('Comfy.UseNewMenu'))

const showTopMenu = ref(true)

const menuRight = ref<HTMLDivElement | null>(null)
// Menu-right holds legacy topbar elements attached by custom scripts
onMounted(() => {
  if (menuRight.value) {
    menuRight.value.appendChild(app.menu.element)
  }
})

const topMenuRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  if (isElectron()) {
    electronAPI().changeTheme({
      height: topMenuRef.value?.getBoundingClientRect().height ?? 0
    })
  }
})
</script>

<style scoped>
.comfyui-menu {
  width: 100vw;
  padding: 0 24px;
  --comfy-topbar-height: 4rem;
  height: var(--comfy-topbar-height);
  background: var(--comfy-menu-bg);
  color: var(--fg-color);
  box-shadow: var(--bar-shadow);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 0.8em;
  box-sizing: border-box;
  z-index: 1000;
  order: 0;
  grid-column: 1/-1;
}

:deep(.p-menubar-item-label) {
  line-height: revert;
}
</style>
