<template>
  <div class="schema-item" :class="{ visible }">
    <div class="actions" v-if="!disabled">
    </div>
    <div class="header">
      <div class="left">
        <h3>
          <slot name="header"></slot>
          <el-dropdown placement="bottom" @command="$emit('command', $event)" @visible-change="visible = $event">
            <svg class="trigger" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="m192 384 320 384 320-384z"></path>
            </svg>
            <template #dropdown>
              <el-dropdown-menu>
                <slot name="menu"></slot>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </h3>
        <slot name="description"></slot>
      </div>
      <div class="right">
        <slot name="right"></slot>
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>

import { ref } from 'vue'

defineProps<{
  disabled?: boolean
}>()

defineEmits(['command'])

const visible = ref(false)

</script>

<style lang="scss">

.k-schema-header {
  font-size: 1.25rem;

  .el-button {
    float: right;
    transform: translateY(-2px);
  }
}

.k-schema-group {
  position: relative;
  padding-left: 1rem;
  border-bottom: 1px solid var(--el-border-color);

  &:empty {
    border-bottom: none;
  }

  > :first-child {
    border-top: none;
  }

  > :last-child {
    border-bottom: none;
  }
}

</style>
