<template>
  <schema-base>
    <template #title><slot name="title"></slot></template>
    <template #desc><slot name="desc"></slot></template>
    <template #menu><slot name="menu"></slot></template>
    <template #prefix><slot name="prefix"></slot></template>
    <template #suffix><slot name="suffix"></slot></template>
    <template #control>
      <el-button @click="insert(entries.length)" :disabled="disabled">{{ t('entry.add-row') }}</el-button>
    </template>
    <div class="bottom k-schema-table-container" ref="container" v-if="columns && entries.length">
      <table class="k-schema-table">
        <tr v-if="schema.type === 'dict' || columns[0][0] !== null">
          <th v-if="schema.type === 'dict'">
            {{ tt(schema.sKey?.meta.description) || t('entry.key') }}
          </th>
          <th v-for="([key, schema]) in columns" :key="key">
            <span>{{ key === null ? t('entry.value') : tt(schema.meta.description) || key }}</span>
          </th>
          <th colspan="3"></th>
        </tr>
        <tr v-for="(_, i) in entries">
          <td
            v-if="schema.type === 'dict'"
            class="key"
            @mouseenter="handleMouseEnter($event, i, -1)"
            @mouseleave="handleMouseLeave($event, i, -1)">
            <el-input
              v-model="entries[i][0]"
              :disabled="disabled"
              @focus="handleFocus($event, i, -1)"
              @blur="handleBlur($event, i, -1)"
              #suffix
            >
              <template v-if="validateCell(i, -1)">
                <el-tooltip :content="t(...validateCell(i, -1))">
                  <span class="suffix-icon">
                    <icon-invalid class="invalid"></icon-invalid>
                  </span>
                </el-tooltip>
              </template>
            </el-input>
          </td>
          <td
            v-for="([key, schema], j) in columns"
            :key="key"
            :class="'k-schema-column-' + schema.type"
            @mouseenter="handleMouseEnter($event, i, j)"
            @mouseleave="handleMouseLeave($event, i, j)">
            <schema-primitive
              minimal
              :schema="schema"
              :disabled="disabled"
              :modelValue="key === null ? entries[i][1] : entries[i][1]?.[key]"
              @update:modelValue="key === null ? entries[i][1] = $event : (entries[i][1] ||= {})[key] = $event"
              @focus="handleFocus($event, i, j)"
              @blur="handleBlur($event, i, j)"
            ></schema-primitive>
          </td>
          <td v-if="!disabled" class="button"
            :class="{ disabled: !i }"
            @mouseenter="handleMouseEnter($event, null)"
            @mouseleave="handleMouseLeave($event, null)">
            <div class="inner" @click.stop="up(i)">
              <icon-arrow-up></icon-arrow-up>
            </div>
          </td>
          <td v-if="!disabled" class="button"
            :class="{ disabled: i === entries.length - 1 }"
            @mouseenter="handleMouseEnter($event, null)"
            @mouseleave="handleMouseLeave($event, null)">
            <div class="inner" @click.stop="down(i)">
              <icon-arrow-down></icon-arrow-down>
            </div>
          </td>
          <td v-if="!disabled" class="button"
            @mouseenter="handleMouseEnter($event, null)"
            @mouseleave="handleMouseLeave($event, null)">
            <div class="inner" @click.stop="del(i)">
              <icon-delete></icon-delete>
            </div>
          </td>
        </tr>
      </table>
      <template v-for="rect in { hover, focus }">
        <div
          v-if="rect"
          :class="['outline', { invalid: rect.invalid }]"
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

import { computed, ref, PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { IconArrowUp, IconArrowDown, IconDelete, IconInvalid } from '../icons'
import { Schema, useEntries, useI18nText, explain } from '../utils'
import SchemaBase from '../base.vue'
import SchemaPrimitive from '../primitive.vue'
import zhCN from '../locales/zh-CN.yml'
import enUS from '../locales/en-US.yml'

const props = defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<{}>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<{}>,
})

defineEmits(['update:modelValue'])

function isPrimitive(schema: Schema): boolean {
  if (['string', 'number', 'boolean'].includes(schema.type)) return true
  if (schema.type === 'union') return schema.list.every(item => item.type === 'const')
}

function ensureColumns(entries: [string, Schema][]) {
  if (entries.every(([, schema]) => isPrimitive(schema))) return entries
}

const columns = computed<[string, Schema][]>(() => {
  const { inner } = props.schema
  if (isPrimitive(inner)) {
    return [[null, inner]]
  } else if (inner.type === 'tuple') {
    return ensureColumns(Object.entries(inner.list))
  } else if (inner.type === 'object') {
    return ensureColumns(Object.entries(inner.dict))
  }
})

const { entries, insert, del, up, down } = useEntries()

interface Rect {
  el: HTMLElement
  top: number
  left: number
  width: number
  height: number
  invalid: boolean
}

const container = ref<HTMLElement>()
const hover = ref<Rect>()
const focus = ref<Rect>()

function getRelative(el: HTMLElement, invalid: any) {
  const target = el.getBoundingClientRect()
  const reference = container.value.getBoundingClientRect()
  return {
    el,
    invalid: !!invalid,
    top: target.top - reference.top,
    left: target.left - reference.left,
    width: target.width,
    height: target.height,
  }
}

function validateCell(i?: number, j?: number) {
  if (i === null) return
  if (j >= 0) return explain(columns.value[j][1], entries.value[i][1])
  const result = explain(props.schema.sKey, entries.value[i][0])
  if (result) return result
  if (j === -1 && entries.value.filter(([key]) => key === entries.value[i][0]).length > 1) {
    return ['errors.duplicate-key'] as const
  }
}

function handleMouseEnter(event: MouseEvent, i?: number, j?: number) {
  const el = event.target as HTMLElement
  if (el === hover.value?.el) return
  hover.value = getRelative(el, validateCell(i, j))
}

function handleMouseLeave(event: MouseEvent, i?: number, j?: number) {
  hover.value = undefined
}

function handleFocus(event: MouseEvent, i?: number, j?: number) {
  let el = event.target as HTMLElement
  while (el && el.tagName !== 'TD') {
    el = el.parentElement
  }
  if (!el || el === focus.value?.el) return
  focus.value = getRelative(el, validateCell(i, j))
}

function handleBlur(event: MouseEvent, i?: number, j?: number) {
  focus.value = undefined
}

const tt = useI18nText()

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
    position: absolute;
    box-sizing: border-box;
    border: 1px solid var(--k-color-active);
    pointer-events: none;

    &.invalid {
      border-color: var(--k-color-danger);
    }
  }
}

.k-schema-table {
  td, th {
    border: 1px solid var(--el-border-color);
  }

  th {
    padding: 0.5rem 0.75rem;
    line-height: 1rem;
  }

  td {
    padding: 0;

    * .el-input__wrapper {
      box-shadow: none;
    }

    .el-select .el-input .el-input__wrapper {
      box-shadow: none !important;
    }
  }

  td {
    transition: var(--color-transition);

    &:hover {
      background-color: var(--k-button-hover-bg);
    }
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

    &.disabled {
      color: var(--k-color-disabled);
      pointer-events: none;
    }
  }

  .k-schema-column-number {
    min-width: 8rem;
    width: 10rem;

    .el-input-number {
      width: 100%;
    }
  }
}

</style>
