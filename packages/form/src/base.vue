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
        <template v-if="collapsible">
          <el-button v-if="collapsed" @click="collapsed = false">{{ t('expand') }}</el-button>
        </template>
      </div>
      <div class="k-schema-menu">
        <el-tooltip ref="tooltip" placement="bottom-end" popper-class="k-menu" effect="light">
          <el-button class="ellipsis">
            <icon-ellipsis></icon-ellipsis>
          </el-button>
          <template #content>
            <div @click="tooltip?.hide()">
              <slot name="menu"></slot>
              <template v-if="collapsible">
                <div class="k-menu-separator"></div>
                <div v-if="collapsed" class="k-menu-item" @click="collapsed = false">
                  <span class="k-menu-icon"><icon-expand></icon-expand></span>
                  {{ t('expand') }}
                </div>
                <div v-else class="k-menu-item" @click="collapsed = true">
                  <span class="k-menu-icon"><icon-collapse></icon-collapse></span>
                  {{ t('collapse') }}
                </div>
              </template>
            </div>
          </template>
        </el-tooltip>
      </div>
    </div>
    <slot></slot>
  </div>

  <slot name="collapse" v-if="!collapsible"></slot>
  <el-collapse-transition v-else>
    <div class="k-schema-group" :class="{ collapsed }" v-show="!collapsed">
      <slot name="collapse"></slot>
    </div>
  </el-collapse-transition>
</template>

<script lang="ts" setup>

import { PropType, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Schema } from './utils'
import { IconCollapse, IconEllipsis, IconExpand } from './icons'
import zhCN from './locales/zh-CN.yml'
import enUS from './locales/en-US.yml'

const props = defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<{}>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<{}>,
  extra: {} as PropType<any>,
  collapsible: {} as PropType<{ initial: boolean }>,
})

defineEmits(['update:modelValue'])

const collapsed = ref(props.collapsible?.initial)
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
    margin: 0.25rem;
    line-height: 1.7;
    font-size: 0.875rem;
  }

  .markdown p {
    margin: 0;
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
  .k-schema-main {
    display: grid;
    grid-template-columns: 1fr auto 2rem;
    justify-content: space-between;
    align-items: center;
    column-gap: 1rem;
    row-gap: 0.25rem;
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

  .k-schema-right {
    display: flex;
    gap: 1rem;
    flex: 1;
    justify-content: flex-end;
  }

  .el-button.ellipsis {
    padding: 8px 9px;

    .k-icon {
      width: 12px;
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
