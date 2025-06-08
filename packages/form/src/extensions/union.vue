<template>
  <k-schema
    v-model="config"
    :schema="active"
    :initial="initial"
    :disabled="disabled"
    :prefix="prefix"
    :extra="{
      foldable: extra?.foldable ?? true,
      required: !!schema.meta.required && isNullable(schema.meta.default) && isNullable(modelValue),
    }"
  >
    <template #title><slot name="title"></slot></template>
    <template #desc>
      <slot name="desc">
        <k-markdown :source="tt(schema.meta.description)"></k-markdown>
      </slot>
    </template>
    <template #prefix>
      <el-select
        v-if="choices.length > 1"
        v-model="selectModel"
        filterable
        :filter-method="filter"
        :disabled="disabled"
      >
        <el-option
          v-for="([item, index]) in options"
          :key="index"
          :value="index"
          :disabled="item.meta.disabled">
          {{ tt(item.meta.description) || item.value }}
          <k-badge :type="type" v-for="{ text, type } in item.meta.badges || []">
            {{ t('badge.' + text) }}
          </k-badge>
        </el-option>
      </el-select>
    </template>
    <template #suffix><slot name="suffix"></slot></template>
  </k-schema>
</template>

<script lang="ts" setup>

import { computed, PropType, ref, watch } from 'vue'
import { deepEqual, isNullable } from 'cosmokit'
import { useI18n } from 'vue-i18n'
import { check, getChoices, getFallback, Schema, useModel, useI18nText } from '../utils'
import zhCN from '../locales/zh-CN.yml'
import enUS from '../locales/en-US.yml'

const props = defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<any>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<any>,
  extra: {} as PropType<any>,
})

defineEmits(['update:modelValue'])

const tt = useI18nText()

const options = ref<[Schema, number][]>()
const choices = ref<Schema[]>()
const cache = ref<any[]>()
const active = ref<Schema>()

watch(() => props.schema, (value) => {
  choices.value = getChoices(props.schema)
  cache.value = choices.value.map((item) => {
    if (item.type === 'const') return item.value
    return getFallback(item, true)
  })
}, { immediate: true })

const filter = (input: string) => {
  if (!input) {
    options.value = choices.value?.map((item, i) => [item, i] as [Schema, number]) || []
    return
  }
  options.value = choices.value!.map((item, i) => [item, i] as [Schema, number]).filter(([item]) => {
    const description = tt(item.meta.description) || String(item.value)
    return description.includes(input)
  })
}

const config = useModel({
  input(value) {
    active.value = null
    let hasTransform = true, depth = 0
    while (!active.value && hasTransform && ++depth < 10) {
      hasTransform = false
      for (const [index, item] of props.schema.list.entries()) {
        if (item.meta.hidden) continue
        if (!check(item, value)) continue
        if (item.type === 'transform') {
          if (!item.callback) continue
          try {
            value = item.callback(value)
          } catch (error) {
            console.error(error)
            continue
          }
          hasTransform = true
          value ??= getFallback(props.schema)
        } else {
          active.value = item
          cache.value[index] = value
        }
        break
      }
    }
    if (deepEqual(value, getFallback(props.schema))) value = null
    return value
  },
})

const selectModel = computed({
  get() {
    if (active.value === props.schema) return
    return tt(active.value?.meta.description) || active.value?.value
  },
  set(index) {
    if (active.value === choices.value[index]) return
    config.value = cache.value[index]
    active.value = choices.value[index]
  },
})

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
