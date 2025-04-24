<template>
  <div class="action-center h-full" v-show="workflowNameText">
    <div v-show="!isEdit" class="work-flow-div" @click="showAction">
      {{ workflowNameText }}<i class="pi pi-angle-down"></i>
    </div>
    <InputText
      v-show="isEdit"
      ref="renameInputRef"
      v-model="editValue"
      class="rename-input"
      type="text"
      @blur="renameWorkFlow"
    />
    <Popover ref="actionPopoverRef" class="action-popover">
      <div class="action-div">
        <div class="action-item" @click="showInput">重命名</div>
        <div class="action-item">保存</div>
        <div class="action-item">另存为</div>
        <div class="action-item">导出</div>
      </div>
    </Popover>
  </div>
</template>
<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Popover from 'primevue/popover'
import { computed, nextTick, ref } from 'vue'

import { useWorkflowService } from '@/services/workflowService'
import { useWorkflowStore } from '@/stores/workflowStore'
import { appendJsonExt } from '@/utils/formatUtil'

const workflowStore = useWorkflowStore()
const workflowService = useWorkflowService()

const activeWorkflow = computed(() => {
  return workflowStore.activeWorkflow
})

const workFlowList = computed(() => {
  return workflowStore.persistedWorkflows || []
})
// 是否保存标识
const isUnsavedText = computed(() =>
  activeWorkflow.value?.isModified || !activeWorkflow.value?.isPersisted
    ? '*'
    : ''
)
// 展示文本
const workflowNameText = computed(() => {
  const workflowName = activeWorkflow.value?.filename
  return workflowName ? isUnsavedText.value + workflowName : ''
})

const actionPopoverRef = ref()
const showAction = (event: MouseEvent) => {
  actionPopoverRef.value.toggle(event)
}
const renameInputRef = ref()
const isEdit = ref(false)
const editValue = ref('')
const showInput = async () => {
  isEdit.value = true
  editValue.value = activeWorkflow.value?.filename || ''
  actionPopoverRef.value.toggle()
  await nextTick()
  renameInputRef.value.$el.focus()
}
const renameWorkFlow = async () => {
  if (!activeWorkflow.value) {
    isEdit.value = false
    return
  }
  const newName = editValue.value.trim()
  if (!editValue.value || newName === (activeWorkflow.value?.filename || '')) {
    isEdit.value = false
    return
  }
  if (workFlowList.value.some((item) => item.filename === newName)) {
    isEdit.value = false
    return
  }
  const newPath = activeWorkflow.value?.directory + '/' + appendJsonExt(newName)
  await workflowService.renameWorkflow(activeWorkflow.value, newPath)
  isEdit.value = false
}
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
    cursor: pointer;
    font-weight: 400;
    font-style: normal;
    line-height: normal;
    align-items: center;
    font-family: 'Microsoft YaHei UI';
  }
  .rename-input {
    --p-inputtext-focus-border-color: #33d528;
    width: 200px;
    height: 32px;
  }
}
</style>
<style>
.action-popover {
  &::after {
    display: none;
  }
  &::before {
    display: none;
  }
  .p-popover-content {
    padding: 0;
    user-select: none;
    .action-div {
      width: 200px;
      padding: 8px 0;
      .action-item {
        display: flex;
        height: 40px;
        padding: 8px 16px;
        cursor: pointer;
        justify-content: space-between;
        align-items: center;
        align-self: stretch;
        color: #fff;
        font-family: 'Microsoft YaHei UI';
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
      }
    }
  }
}
</style>
