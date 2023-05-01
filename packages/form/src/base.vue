<template>
  <div class="schema-item">
    <div class="actions"></div>
    <div class="header">
      <div class="left">
        <h3>
          <slot name="title"></slot>
          <el-dropdown
            v-if="!disabled"
            placement="bottom"
            @visible-change="$emit('visible-change', $event)">
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
        <slot name="desc"></slot>
      </div>
      <div class="right">
        <slot name="prefix"></slot>
        <slot name="control"></slot>
        <slot name="suffix"></slot>
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>

import { PropType } from 'vue'
import { Schema } from './utils'

defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<{}>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<{}>,
  foldable: Boolean,
})

defineEmits(['update:modelValue', 'visible-change'])

</script>

<style lang="scss">

.schema-item {
  p {
    margin: 0;
    line-height: 1.7;
    font-size: 0.875rem;
  }

  ul {
    list-style: none;
    width: 100%;
    padding-left: 1rem;
    font-size: 0.875rem;

    .el-radio, .el-checkbox {
      height: 1.375rem;
    }
  }

  .el-button.ellipsis {
    padding: 8px 10px;
  }

  .el-button + .el-button {
    margin-left: 0;
  }
}

.schema-item {
  position: relative;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--el-border-color-light);
  transition: var(--color-transition);

  &:first-child, :not(.schema-item):not(.k-schema-group) + & {
    border-top: 1px solid var(--el-border-color-light);
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
    line-height: 1.7;
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
    .el-dropdown {
      margin-left: 0.5rem;
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
    display: flex;
    gap: 1rem;
    flex: 1;
    justify-content: flex-end;
  }

  .bottom {
    margin: 0.5rem 0 0.25rem;
  }

  $actions-width: 0.5rem;

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
