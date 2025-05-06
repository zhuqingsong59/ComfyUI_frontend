<!-- The main global dialog to show various things -->
<template>
  <Dialog
    v-for="(item, index) in dialogStore.dialogStack"
    :key="item.key"
    v-model:visible="item.visible"
    class="global-dialog"
    :class="item.customClass"
    v-bind="item.dialogComponentProps"
    :auto-z-index="false"
    :pt="item.dialogComponentProps.pt"
    :pt:mask:style="{ zIndex: baseZIndex + index + 1 }"
    :aria-labelledby="item.key"
  >
    <template #header>
      <component
        :is="item.headerComponent"
        v-if="item.headerComponent"
        :id="item.key"
      />
      <h3 v-else :id="item.key">
        {{ item.title || ' ' }}
      </h3>
    </template>

    <component
      :is="item.component"
      v-bind="item.contentProps"
      :maximized="item.dialogComponentProps.maximized"
    />

    <template v-if="item.footerComponent" #footer>
      <component :is="item.footerComponent" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ZIndex } from '@primeuix/utils/zindex'
import { usePrimeVue } from '@primevue/core'
import Dialog from 'primevue/dialog'
import { computed, onMounted } from 'vue'

import { useDialogStore } from '@/stores/dialogStore'

const dialogStore = useDialogStore()

const primevue = usePrimeVue()

const baseZIndex = computed(() => {
  return primevue?.config?.zIndex?.modal ?? 1100
})

onMounted(() => {
  const mask = document.createElement('div')
  ZIndex.set('model', mask, baseZIndex.value)
})
</script>

<style>
.global-dialog .p-dialog-header {
  @apply p-2 2xl:p-[var(--p-dialog-header-padding)];
  @apply pb-0;
}

.global-dialog .p-dialog-content {
  @apply p-2 2xl:p-[var(--p-dialog-content-padding)];
  @apply pt-0;
}
/* 删除工作流确认弹窗 */
.workflow-delete-dialog {
  width: 312px;
  border-radius: 4px;
  .p-dialog-header {
    display: flex;
    height: 40px;
    padding: 0px 16px;
    align-items: center;
    align-self: stretch;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    h3 {
      margin: 0;
      color: #fff;
      font-family: 'Microsoft YaHei UI';
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
    }
    .p-dialog-header-actions {
      .p-dialog-close-button {
        height: 20px;
        width: 20px;
      }
    }
  }
  .p-dialog-content {
    padding: 0 16px;
    .prompt-dialog-content {
      margin: 0;
      gap: 0;
      height: 160px;
      ul {
        display: none;
      }
      & > .p-message .p-message-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        align-self: stretch;
        flex-shrink: 0;
        height: 96px;
        color: #fff;
        font-family: 'Microsoft YaHei UI';
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
        .p-message-icon {
          width: 48px;
          height: 48px;
          font-size: 48px;
        }
      }
      & > .p-message + div {
        margin-top: 16px;
        .p-button {
          height: 32px;
          width: 60px;
          border-radius: 2px;
          color: #fff;
          font-family: 'Microsoft YaHei UI';
          font-size: 14px;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
          &.p-button-secondary {
            border: 1px solid rgba(255, 255, 255, 0.12);
            background: rgba(255, 255, 255, 0.12);
          }
          &.p-button-danger {
            background: #db5e00;
          }
        }
      }
    }
  }
}
</style>
