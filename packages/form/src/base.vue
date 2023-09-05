<template>
  <div class="k-schema-item" v-bind="$attrs">
    <div class="actions"></div>
    <div class="k-schema-main">
      <div class="k-schema-left">
        <h3>
          <slot name="title"></slot>
        </h3>
        <slot name="desc"></slot>
      </div>
      <div class="k-schema-right">
        <template v-if="!collapsed">
          <slot name="prefix"></slot>
          <slot name="control"></slot>
          <slot name="suffix"></slot>
        </template>
        <template v-if="$slots.collapse">
          <el-button v-if="!collapsed" @click="collapsed = true">{{ t('collapse') }}</el-button>
          <el-button v-else @click="collapsed = false">{{ t('expand') }}</el-button>
        </template>
        <el-tooltip ref="tooltip" placement="bottom-end" popper-class="k-menu" effect="light">
          <el-button class="ellipsis">
            <icon-ellipsis></icon-ellipsis>
          </el-button>
          <template #content>
            <div @click="tooltip.hide()">
              <slot name="menu"></slot>
            </div>
          </template>
        </el-tooltip>
      </div>
    </div>
    <slot></slot>
  </div>
  <el-collapse-transition v-if="$slots.collapse">
    <div class="k-schema-group" v-show="!collapsed">
      <slot name="collapse"></slot>
    </div>
  </el-collapse-transition>
</template>

<script lang="ts" setup>

import { PropType, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Schema } from './utils'
import { IconEllipsis } from './icons'
import zhCN from './locales/zh-CN.yml'
import enUS from './locales/en-US.yml'

defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<{}>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<{}>,
  extra: {} as PropType<any>,
})

defineEmits(['update:modelValue', 'visible-change'])

const collapsed = ref(false)
const tooltip = ref(null)

const { t, setLocaleMessage } = useI18n({
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})

if (import.meta.hot) {
  import.meta.hot.accept('./locales/zh-CN.yml', (module) => {
    setLocaleMessage('zh-CN', module.default)
  })
  import.meta.hot.accept('./locales/en-US.yml', (module) => {
    setLocaleMessage('en-US', module.default)
  })
}

</script>

<style lang="scss">

.k-schema-item {
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

  .el-button + .el-button {
    margin-left: 0;
  }
}

.k-schema-item {
  position: relative;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--el-border-color-light);
  transition: var(--color-transition);

  &:first-child, :not(.k-schema-item):not(.k-schema-group) + & {
    border-top: 1px solid var(--el-border-color-light);
  }

  & + h2 {
    margin-top: 2rem;
  }

  &:hover {
    background-color: var(--el-fill-color-light);
  }

  .k-schema-main {
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

  .k-schema-left {
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

  .k-schema-right {
    display: flex;
    gap: 1rem;
    flex: 1;
    justify-content: flex-end;

    .el-button.ellipsis {
      padding: 8px 10px;

      .k-icon {
        width: 12px;
      }
    }
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

.k-schema-header {
  font-size: 1.25rem;
  margin: 1rem 0;

  &:not(:first-child) {
    margin-top: 2rem;
  }
}

.k-schema-group {
  position: relative;
  border-bottom: 1px solid var(--el-border-color-light);

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
