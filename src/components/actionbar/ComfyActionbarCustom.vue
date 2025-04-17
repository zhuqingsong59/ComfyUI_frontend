<template>
  <div class="actionbar w-fit">
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
    return `正在排队中(${queueCountStore.count.value})人`
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
  .comfyui-queue-button {
    width: 160px;
    font-size: 16px;
    --p-button-border-radius: 4px;
    font-family: 'Microsoft YaHei UI';
    --p-button-label-font-weight: 400;
    --p-button-success-color: #222722;
    --p-button-success-background: #43ff32;
  }
}
</style>
