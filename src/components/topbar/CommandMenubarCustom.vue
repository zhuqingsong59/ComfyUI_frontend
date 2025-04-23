<template>
  <div class="top-menubar border-none p-0 bg-transparent">
    <!-- v-tooltip.right="`使用'保存图像'节点出图会显示在图库中`" -->
    <div class="top-menu-item"><i class="pi pi-images`"></i>图库</div>
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
        >
          {{ workFlowItem.filename }}
          <span class="date">
            {{ timestampToDateString(workFlowItem.lastModified * 1000) }}
          </span>
          <span
            class="delete"
            @click="workflowService.deleteWorkflow(workFlowItem)"
          >
            <i class="pi pi-trash" />
          </span>
        </div>
      </template>
    </div>
  </Popover>
</template>

<script setup lang="ts">
import Popover from 'primevue/popover'
import { computed, ref } from 'vue'

import { useWorkflowService } from '@/services/workflowService'
import { useCommandStore } from '@/stores/commandStore'
import type { ComfyWorkflow } from '@/stores/workflowStore'
import { useWorkflowStore } from '@/stores/workflowStore'

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

const handleWorkflowClick = async (workFlowItem: ComfyWorkflow) => {
  if (workFlowItem.path === activeWorkflow.value.path) {
    return
  }
  await workflowService.openWorkflow(workFlowItem)
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
</style>
