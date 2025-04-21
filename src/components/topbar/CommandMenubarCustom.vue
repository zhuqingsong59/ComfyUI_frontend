<template>
  <div class="top-menubar border-none p-0 bg-transparent">
    <div class="top-menu-item"><i class="pi pi-images"></i>图库</div>
    <div class="top-menu-item" @click="toggle">
      <i class="pi pi-list"></i>工作流
    </div>
    <div class="top-menu-item">
      <i-lucide:plus style="font-size: 20px" />新建
    </div>
  </div>
  <Popover ref="workFlowListRef" class="work-flow-list-popover">
    <div class="work-flow-list">222</div>
  </Popover>
</template>

<script setup lang="ts">
import Popover from 'primevue/popover'
import { ref } from 'vue'

const workFlowListRef = ref()
const toggle = (event: MouseEvent) => {
  workFlowListRef.value.toggle(event)
}
</script>

<style scoped>
.top-menubar {
  display: flex;
  gap: 24px;
  .top-menu-item {
    gap: 6px;
    padding: 8px;
    display: flex;
    cursor: pointer;
    border-radius: 4px;
    align-items: center;
    justify-content: center;
    color: #fff;
    text-align: center;
    font-family: 'Microsoft YaHei UI';
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    i {
      font-size: 20px;
    }
  }
}
</style>
<style>
.work-flow-list-popover {
  left: 0 !important;
  &::after {
    display: none;
  }
  &::before {
    display: none;
  }
  .p-popover-content {
    padding: 0;
    .work-flow-list {
      width: 320px;
      padding: 8px 0;
    }
  }
}
</style>
