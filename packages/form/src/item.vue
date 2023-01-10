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

  h3 {
    margin: 0;
    font-size: 1rem;
    line-height: 1.5;
    position: relative;
    user-select: none;
    display: flex;
    align-items: center;

    > * {
      flex: 0 0 auto;
    }

    .prefix {
      font-weight: normal;
      text-overflow: ellipsis;
      flex: 0 1 auto;
      overflow: hidden;
    }
  }

  .left {
    display: inline-block;

    .el-dropdown {
      margin-left: 0.25rem;
      margin-top: 2px;
    }

    .trigger {
      height: 1rem;
      cursor: pointer;
      opacity: 0;
      transition: var(--color-transition);
    }
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
    position: absolute;
    top: 0;
    height: 100%;
    left: 0;
    width: $actions-width;
    border-left: 2px solid transparent;
    transition: var(--color-transition);
  }

  &:hover .trigger {
    opacity: 0.75;
  }

  &.visible .trigger {
    opacity: 1;
  }

  &.changed .actions {
    border-left-color: var(--el-color-primary);
  }

  &.required .actions {
    border-left-color: var(--el-color-error);
  }

  &.invalid .actions {
    border-left-color: var(--el-color-warning);
  }
}

</style>
