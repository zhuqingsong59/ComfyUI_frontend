<template>
  <div class="action-center h-full" v-show="workflowNameText">
    <div class="work-flow-div">
      {{ workflowNameText }}<i class="pi pi-angle-down"></i>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'

import { useWorkflowStore } from '@/stores/workflowStore'

const workflowStore = useWorkflowStore()

const activeWorkflow = computed(() => {
  return workflowStore.activeWorkflow
})
// 是否保存标识
const isUnsavedText = computed(() =>
  activeWorkflow.value?.isModified || !activeWorkflow.value?.isPersisted
    ? '*'
    : ''
)
// 展示文本
const workflowNameText = computed(() => {
  const workflowName = workflowStore.activeWorkflow?.filename
  return workflowName ? isUnsavedText.value + workflowName : ''
})
</script>
<style scoped>
.action-center {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .work-flow-div {
    gap: 4px;
    color: #fff;
    display: flex;
    font-size: 16px;
    font-weight: 400;
    font-style: normal;
    line-height: normal;
    align-items: center;
    font-family: 'Microsoft YaHei UI';
  }
}
</style>
