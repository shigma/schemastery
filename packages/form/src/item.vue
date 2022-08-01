<template>
  <div class="schema-item">
    <div class="actions" :class="{ visible }" v-if="!disabled">
      <el-dropdown placement="bottom-start" @command="$emit('command', $event)" @visible-change="visible = $event">
        <icon-cog></icon-cog>
        <template #dropdown>
          <el-dropdown-menu>
            <slot name="menu"></slot>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div class="header">
      <div class="left">
        <slot name="left"></slot>
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
import { IconCog } from './icons'

defineProps<{
  disabled?: boolean
}>()

defineEmits(['command'])

const visible = ref(false)

</script>

<style lang="scss">

.schema-item {
  position: relative;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--el-border-color);
  transition: var(--color-transition);

  &:first-child, :not(.schema-item):not(.k-schema-group) + & {
    border-top: 1px solid var(--el-border-color);
  }

  & + h2 {
    margin-top: 2rem;
  }

  &:hover {
    background-color: var(--el-fill-color-light);
  }

  .header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    column-gap: 1rem;
    min-height: 3rem;
  }

  .left {
    display: inline-block;
  }

  .right {
    margin: 0.5rem 0;
    float: right;
    display: inline-flex;
    gap: 1rem;
    flex: 1;
    justify-content: flex-end;
  }

  .bottom {
    margin: 0.5rem 0 0.25rem;
  }

  $actions-width: 3rem;

  .actions {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    height: 100%;
    left: -$actions-width;
    width: $actions-width;
    border-right: 2px solid transparent;
    transition: var(--color-transition);

    .k-icon {
      height: 1rem;
      padding: 0 5px;
      cursor: pointer;
      opacity: 0;
      transition: var(--color-transition);
    }
  }

  &:hover .actions .k-icon {
    opacity: 0.75;
  }

  .actions.visible .k-icon {
    opacity: 1;
  }

  &.changed .actions {
    border-right-color: var(--el-color-primary);
  }

  &.required .actions {
    border-right-color: var(--el-color-error);
  }

  &.invalid .actions {
    border-right-color: var(--el-color-warning);
  }
}

</style>
