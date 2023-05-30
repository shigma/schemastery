<template>
  <schema-base>
    <template #title><slot name="title"></slot></template>
    <template #desc><slot name="desc"></slot></template>
    <template #menu><slot name="menu"></slot></template>
    <template #prefix><slot name="prefix"></slot></template>
    <template #suffix><slot name="suffix"></slot></template>
    <template #control>
      <el-button @click="add()" :disabled="disabled">添加项目</el-button>
    </template>
    <div class="bottom k-schema-table-container">
      <table class="k-schema-table" v-if="entries.length">
        <tr v-for="([key], index) in entries">
          <td
            v-if="schema.type === 'dict'"
            class="key"
            :class="{ invalid: entries.filter(e => e[0] === key).length > 1 }"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
          >
            <el-input
              v-model="entries[index][0]"
              :disabled="disabled"
              @focus="handleFocus"
              @blur="handleBlur"
            ></el-input>
          </td>
          <td
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave">
            <el-input
              v-model="entries[index][1]"
              :disabled="disabled"
              :type="schema.inner.type === 'number' ? 'number' : 'text'"
              :max="schema.inner.meta.max"
              :min="schema.inner.meta.min"
              :step="schema.inner.meta.step"
              @focus="handleFocus"
              @blur="handleBlur"
            ></el-input>
          </td>
          <td class="button"
            :class="{ disabled: disabled || !index }"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave">
            <div class="inner" @click.stop="up(index)">
              <icon-arrow-up></icon-arrow-up>
            </div>
          </td>
          <td class="button"
            :class="{ disabled: disabled || index === entries.length - 1 }"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave">
            <div class="inner" @click.stop="down(index)">
              <icon-arrow-down></icon-arrow-down>
            </div>
          </td>
          <td class="button"
            :class="{ disabled }"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave">
            <div class="inner" @click.stop="del(index)">
              <icon-close></icon-close>
            </div>
          </td>
        </tr>
      </table>
      <template v-for="rect in { hover, focus }">
        <div
          v-if="rect"
          class="outline"
          :style="{
            top: rect.top + 'px',
            left: rect.left + 'px',
            width: rect.width + 'px',
            height: rect.height + 'px',
          }"
        ></div>
      </template>
    </div>
  </schema-base>
</template>

<script lang="ts" setup>

import { ref, PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { IconArrowUp, IconArrowDown, IconClose } from '../icons'
import { Schema, useEntries } from '../utils'
import SchemaBase from '../base.vue'
import zhCN from '../locales/zh-CN.yml'
import enUS from '../locales/en-US.yml'

defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<{}>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<{}>,
})

defineEmits(['update:modelValue'])

const { entries, add, del, up, down } = useEntries()

const hover = ref<DOMRect>()
const focus = ref<DOMRect>()

function handleMouseEnter(event: MouseEvent) {
  const el = event.target as HTMLElement
  hover.value = el.getBoundingClientRect()
}

function handleMouseLeave(event: MouseEvent) {
  hover.value = undefined
}

function handleFocus(event: MouseEvent) {
  let el = event.target as HTMLElement
  while (el && el.tagName !== 'TD') {
    el = el.parentElement
  }
  if (!el) return
  focus.value = el.getBoundingClientRect()
}

function handleBlur(event: MouseEvent) {
  focus.value = undefined
}

const { t, setLocaleMessage } = useI18n({
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})

if (import.meta.hot) {
  import.meta.hot.accept('../locales/zh-CN.yml', (module) => {
    setLocaleMessage('zh-CN', module.default)
  })
  import.meta.hot.accept('../locales/en-US.yml', (module) => {
    setLocaleMessage('en-US', module.default)
  })
}

</script>

<style lang="scss">

.k-schema-table-container {
  position: relative;

  .outline {
    position: fixed;
    box-sizing: border-box;
    border: 1px solid var(--k-color-active);
    pointer-events: none;
  }
}

.k-schema-table {
  td {
    padding: 0;
    border: 1px solid var(--el-border-color);

    &.invalid {
      background-color: var(--k-color-warning-fade);
    }

    .el-input__wrapper {
      z-index: 1;
      box-shadow: none;
    }
  }

  td {
    transition: var(--color-transition);

    &.disabled {
      pointer-events: none;
    }

    &:hover {
      background-color: var(--k-button-hover-bg);
    }
  }

  td.key {
    width: 30%;
  }

  td.button {
    width: 2rem;
    color: var(--k-text-light);

    &:hover {
      color: var(--k-color-active);
    }

    .inner {
      height: 2rem;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }

    .k-icon {
      height: 1rem;
    }
  }
}

</style>
