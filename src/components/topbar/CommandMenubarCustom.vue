<template>
  <div class="top-menubar border-none p-0 bg-transparent">
    <!-- v-tooltip.right="`使用'保存图像'节点出图会显示在图库中`" -->
    <div class="top-menu-item"><i class="pi pi-images"></i>图库</div>
    <div class="top-menu-item" @click="showWorkFlowList">
      <i class="pi pi-list"></i>工作流
    </div>
    <div
      class="top-menu-item"
      @click="() => commandStore.execute('Comfy.NewBlankWorkflow')"
    >
      <i-lucide:plus style="width: 20px; height: 20px" />新建
    </div>
  </div>
  <Popover ref="workFlowListRef" class="work-flow-list-popover">
    <div class="work-flow-list">
      <div v-if="!workFlowList.length" class="empty">暂无保存的工作流</div>
      <template v-else>
        <div
          v-for="workFlowItem in workFlowList"
          :key="workFlowItem.path"
          class="workFlow-item"
          :class="{ active: workFlowItem.path === activeWorkflow.path }"
          @click="handleWorkflowClick(workFlowItem)"
          @contextmenu="openRenamePopover($event, workFlowItem)"
        >
          <div style="min-width: 50px">
            {{ workFlowItem.filename }}
          </div>
          <span class="date">
            {{ timestampToDateString(workFlowItem.lastModified * 1000) }}
          </span>
          <span
            class="delete"
            @click.stop="workflowService.deleteWorkflow(workFlowItem)"
          >
            <i class="pi pi-trash" />
          </span>
        </div>
      </template>
    </div>
  </Popover>
  <Popover ref="renamePopoverRef" class="work-flow-rename-popover">
    <div class="rename-div">
      <div v-show="!isEdit" @click="showInput">重命名</div>
      <InputText
        v-show="isEdit"
        ref="renameInputRef"
        v-model="editValue"
        class="rename-input"
        type="text"
        @blur="ranameWorkFlow"
      />
    </div>
  </Popover>
</template>

<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Popover from 'primevue/popover'
import { computed, nextTick, ref } from 'vue'

import { useWorkflowService } from '@/services/workflowService'
import { useCommandStore } from '@/stores/commandStore'
import type { ComfyWorkflow } from '@/stores/workflowStore'
import { useWorkflowStore } from '@/stores/workflowStore'
import { appendJsonExt } from '@/utils/formatUtil'

const commandStore = useCommandStore()
const workflowStore = useWorkflowStore()
const workflowService = useWorkflowService()

const timestampToDateString = (timestamp: string | number | Date) => {
  const date = new Date(timestamp)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // 月份从0开始，因此需要加1
  const day = String(date.getDate()).padStart(2, '0')
  // const hours = String(date.getHours()).padStart(2, '0')
  // const minutes = String(date.getMinutes()).padStart(2, '0')
  // const seconds = String(date.getSeconds()).padStart(2, '0')
  // 格式化日期字符串
  // return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
  return `${year}/${month}/${day}`
}

const workFlowList = computed(() => {
  return workflowStore.persistedWorkflows || []
})
const activeWorkflow = computed(() => {
  return workflowStore.activeWorkflow || { path: '' }
})

const workFlowListRef = ref()
// 展示工作流列表
const showWorkFlowList = (event: MouseEvent) => {
  workFlowListRef.value.toggle(event)
}
// 切换工作流
const handleWorkflowClick = async (workFlowItem: ComfyWorkflow) => {
  if (workFlowItem.path === activeWorkflow.value.path) {
    return
  }
  await workflowService.openWorkflow(workFlowItem)
}
// 重命名
const renamePopoverRef = ref()
const renameInputRef = ref()
const isEdit = ref(false)
const editValue = ref('')
let ranameWorkFlowItem: ComfyWorkflow
// 打开菜单
const openRenamePopover = (event: MouseEvent, workFlowItem: ComfyWorkflow) => {
  event.preventDefault()
  isEdit.value = false
  ranameWorkFlowItem = workFlowItem
  editValue.value = workFlowItem.filename
  renamePopoverRef.value.toggle(event)
}
// 展示输入框
const showInput = async () => {
  isEdit.value = true
  await nextTick()
  renameInputRef.value.$el.focus()
}
const ranameWorkFlow = async () => {
  const newName = editValue.value.trim()
  if (!editValue.value || newName === ranameWorkFlowItem.filename) return
  if (workFlowList.value.some((item) => item.filename === newName)) return
  const newPath = ranameWorkFlowItem.directory + '/' + appendJsonExt(newName)
  await workflowService.renameWorkflow(ranameWorkFlowItem, newPath)
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
    user-select: none;
    .work-flow-list {
      width: 320px;
      padding: 8px 0;
      .empty {
        display: flex;
        height: 40px;
        padding: 8px 16px;
        align-items: center;
        align-self: stretch;
        justify-content: center;
        color: rgba(255, 255, 255, 0.6);
        font-family: 'Microsoft YaHei UI';
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
      }
      .workFlow-item {
        display: flex;
        height: 40px;
        padding: 8px 16px;
        justify-content: space-between;
        align-items: center;
        align-self: stretch;
        color: #fff;
        font-family: 'Microsoft YaHei UI';
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        cursor: pointer;
        line-height: normal;
        &.active {
          color: #33d528;
        }
        &:hover {
          background: rgba(255, 255, 255, 0.12);
          .date {
            display: none;
          }
          .delete {
            display: block;
          }
        }
        span {
          color: #fff;
          &.date {
            color: rgba(255, 255, 255, 0.6);
          }
          &.delete {
            display: none;
            &:hover {
              color: rgba(255, 255, 255, 0.6);
            }
          }
        }
      }
    }
  }
}
.work-flow-rename-popover {
  /* left: 0 !important; */
  &::after {
    display: none;
  }
  &::before {
    display: none;
  }
  .rename-div {
    cursor: pointer;
    width: 240px;
    text-align: center;
    div {
      color: #fff;
      font-family: 'Microsoft YaHei UI';
      font-size: 14px;
      text-align: left;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
    }
    .rename-input {
      --p-inputtext-focus-border-color: #33d528;
      width: 200px;
      height: 32px;
    }
  }
}
</style>
