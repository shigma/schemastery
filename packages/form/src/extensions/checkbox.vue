<template>
  <schema-base>
    <template #title><slot name="title"></slot></template>
    <template #desc><slot name="desc"></slot></template>
    <template #menu>
      <slot name="menu"></slot>
      <div class="k-menu-separator"></div>
      <div class="k-menu-item" :class="{ disabled }" @click="selectAll">
        <span class="k-menu-icon"><icon-square-check></icon-square-check></span>
        {{ t('select.all') }}
      </div>
      <div class="k-menu-item" :class="{ disabled }" @click="selectNone">
        <span class="k-menu-icon"><icon-square-empty></icon-square-empty></span>
        {{ t('select.none') }}
      </div>
    </template>
    <template #prefix><slot name="prefix"></slot></template>
    <template #suffix><slot name="suffix"></slot></template>
    <ul class="bottom">
      <li v-for="item in list" :key="item.value">
        <el-checkbox
          :disabled="disabled || item.meta.disabled"
          :modelValue="config.includes(item.value)"
          @update:modelValue="toggle(item.value)"
        >
          {{ tt(item.meta.description) || item.value }}
          <k-badge :type="type" v-for="{ text, type } in item.meta.badges || []">
            {{ t('badge.' + text) }}
          </k-badge>
        </el-checkbox>
      </li>
    </ul>
  </schema-base>
</template>

<script lang="ts" setup>

import { PropType, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { difference, union } from 'cosmokit'
import { Schema, useI18nText, useModel } from '../utils'
import SchemaBase from '../base.vue'
import zhCN from '../locales/zh-CN.yml'
import enUS from '../locales/en-US.yml'
import { IconSquareCheck, IconSquareEmpty } from '../icons'

const props = defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<number>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<{}>,
})

defineEmits(['update:modelValue'])

const tt = useI18nText()

const keys = computed(() => {
  if (props.schema.type === 'bitset') {
    return Object.keys(props.schema.bits)
  } else if (props.schema.type === 'array') {
    return props.schema.inner.list.map(item => item.value)
  }
})

const list = computed(() => {
  if (props.schema.type === 'bitset') {
    return Object.keys(props.schema.bits).map(key => Schema.const(key))
  } else if (props.schema.type === 'array') {
    return props.schema.inner.list
  }
})

// force mutate array
function toggle(key: string) {
  if (config.value.includes(key)) {
    config.value = config.value.filter(k => k !== key)
  } else {
    config.value = [...config.value, key]
  }
}

const config = useModel<string[]>({
  input(value) {
    if (Array.isArray(value)) return value
    return Object.entries(props.schema.bits)
      .filter(([key, bit]) => value & bit)
      .map(([key]) => key)
  },
  output(value) {
    return value.sort((a, b) => {
      const indexA = keys.value.indexOf(a)
      const indexB = keys.value.indexOf(b)
      if (indexA < 0) {
        return indexB < 0 ? 0 : 1
      } else {
        return indexB < 0 ? -1 : indexA - indexB
      }
    })
  },
})

function selectAll() {
  config.value = union(config.value, keys.value)
}

function selectNone() {
  config.value = difference(config.value, keys.value)
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
