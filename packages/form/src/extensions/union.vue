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
        :disabled="disabled"
      >
        <el-option
          v-for="(item, index) in choices"
          :key="index"
          :value="index"
          :disabled="item.meta.disabled"
          :label="tt(item.meta.description) || item.value"
        ></el-option>
      </el-select>
    </template>
    <template #suffix><slot name="suffix"></slot></template>
  </k-schema>
</template>

<script lang="ts" setup>

import { computed, PropType, ref, watch, WatchStopHandle } from 'vue'
import { deepEqual, isNullable } from 'cosmokit'
import { check, getChoices, getFallback, Schema, useI18nText } from '../utils'

const props = defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<any>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<any>,
  extra: {} as PropType<any>,
})

const emit = defineEmits(['update:modelValue'])

const tt = useI18nText()

const config = ref()
const choices = ref<Schema[]>()
const cache = ref<any[]>()
const active = ref<Schema>()
let stop: WatchStopHandle

const doWatch = () => watch(config, (value) => {
  const index = choices.value.indexOf(active.value)
  if (index >= 0) cache.value[index] = value
  emit('update:modelValue', deepEqual(value, props.schema.meta.default) ? null : value)
}, { deep: true })

watch(() => props.schema, (value) => {
  choices.value = getChoices(props.schema)
  cache.value = choices.value.map((item) => {
    if (item.type === 'const') return item.value
    return getFallback(item, true)
  })
}, { immediate: true })

watch(() => [props.modelValue, props.schema] as const, ([value, schema]) => {
  stop?.()
  config.value = value
  value ??= schema.meta.default
  active.value = null
  let hasTransform = true, depth = 0
  while (!active.value && hasTransform && ++depth < 10) {
    hasTransform = false
    for (const item of schema.list) {
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
        config.value = value
        value ??= schema.meta.default
      } else {
        active.value = item
      }
      break
    }
  }
  stop = doWatch()
}, { immediate: true, deep: true })

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

</script>
