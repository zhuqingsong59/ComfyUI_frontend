<template>
  <div class="actionbar w-fit">
    <span
      v-tooltip.bottom="'保存工作流'"
      class="action-span"
      @click="() => commandStore.execute('Comfy.SaveWorkflow')"
    >
      <i-lucide:save style="width: 20px; height: 20px" />
    </span>
    <span
      v-tooltip.bottom="'上传本地工作流'"
      class="action-span"
      @click="() => commandStore.execute('Comfy.OpenWorkflow')"
    >
      <i-lucide:arrow-up-from-line style="width: 20px; height: 20px" />
    </span>
    <span
      v-tooltip.bottom="'导出工作流'"
      class="action-span"
      @click="() => commandStore.execute('Comfy.ExportWorkflow')"
    >
      <i-lucide:arrow-down-to-line style="width: 20px; height: 20px" />
    </span>
    <Button
      severity="success"
      class="comfyui-queue-button"
      data-testid="queue-button"
      :label="btnLabel"
      @click="btnClick"
    >
      <template #icon>
        <i-lucide:circle-pause v-if="isExecutingPrompt" />
      </template>
    </Button>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import Button from 'primevue/button'
import { computed } from 'vue'

import { useCommandStore } from '@/stores/commandStore'
import { useQueuePendingTaskCountStore } from '@/stores/queueStore'

const queueCountStore = storeToRefs(useQueuePendingTaskCountStore())

const isExecutingPrompt = computed(() => !!queueCountStore.count.value)
const hasQueuePendingTasks = computed(() => queueCountStore.count.value > 1)

const btnLabel = computed(() => {
  if (hasQueuePendingTasks.value) {
    return `正在排队中(${queueCountStore.count.value}人)`
  } else if (isExecutingPrompt.value) {
    return '中止'
  }
  return '开始生图'
})

const commandStore = useCommandStore()
const btnClick = async () => {
  const command = hasQueuePendingTasks.value
    ? 'Comfy.ClearPendingTasks'
    : isExecutingPrompt.value
      ? 'Comfy.Interrupt'
      : 'Comfy.QueuePrompt'

  await commandStore.execute(command)
}
</script>

<style scoped>
.actionbar {
  gap: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  .action-span {
    cursor: pointer;
  }
  .comfyui-queue-button {
    width: 160px;
    font-size: 16px;
    padding: 0.5rem 0;
    line-height: normal;
    --p-button-border-radius: 4px;
    font-family: 'Microsoft YaHei UI';
    --p-button-label-font-weight: 400;
    --p-button-success-color: #222722;
    --p-button-success-background: #43ff32;
  }
}
</style>
