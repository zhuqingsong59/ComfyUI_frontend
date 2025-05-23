<template>
  <div>
    <!-- This component does not render anything visible. -->
  </div>
</template>

<script setup lang="ts">
import { useTitle } from '@vueuse/core'
import { computed } from 'vue'

import { useExecutionStore } from '@/stores/executionStore'
import { useSettingStore } from '@/stores/settingStore'
import { useWorkflowStore } from '@/stores/workflowStore'

const DEFAULT_TITLE = '达笔'
const TITLE_SUFFIX = ' - 达笔'

const executionStore = useExecutionStore()
const executionText = computed(() =>
  executionStore.isIdle
    ? ''
    : `[${Math.round(executionStore.executionProgress * 100)}%]`
)

const settingStore = useSettingStore()
const betaMenuEnabled = computed(
  () => settingStore.get('Comfy.UseNewMenu') !== 'Disabled'
)

const workflowStore = useWorkflowStore()
const isUnsavedText = computed(() =>
  workflowStore.activeWorkflow?.isModified ||
  !workflowStore.activeWorkflow?.isPersisted
    ? ' *'
    : ''
)
const workflowNameText = computed(() => {
  const workflowName = workflowStore.activeWorkflow?.filename
  return workflowName
    ? isUnsavedText.value + workflowName + TITLE_SUFFIX
    : DEFAULT_TITLE
})

const nodeExecutionTitle = computed(() =>
  executionStore.executingNode && executionStore.executingNodeProgress
    ? `${executionText.value}[${Math.round(executionStore.executingNodeProgress * 100)}%] ${executionStore.executingNode.type}`
    : ''
)

const workflowTitle = computed(
  () =>
    executionText.value +
    (betaMenuEnabled.value ? workflowNameText.value : DEFAULT_TITLE)
)

const title = computed(() => nodeExecutionTitle.value || workflowTitle.value)
useTitle(title)
</script>
