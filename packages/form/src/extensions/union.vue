<template>
  <k-schema
    v-model="config"
    :schema="active"
    :initial="initial"
    :disabled="disabled"
    :prefix="prefix"
    :extra="{
      required: !!schema.meta.required && isNullable(schema.meta.default) && isNullable(modelValue),
    }"
  >
    <template #title><slot name="title"></slot></template>
    <template #desc>
      <k-markdown :source="schema.meta.description"></k-markdown>
    </template>
    <template #prefix>
      <el-select
        v-model="selectModel"
        filterable
        :disabled="disabled"
      >
        <el-option
          v-for="(item, index) in choices"
          :key="index"
          :value="index"
          :label="item.meta.description || item.value"
        ></el-option>
      </el-select>
    </template>
    <template #suffix><slot name="suffix"></slot></template>
  </k-schema>
</template>

<script lang="ts" setup>

import { computed, PropType, ref, watch, WatchStopHandle } from 'vue'
import { check, deepEqual, getChoices, getFallback, isNullable, Schema } from '../utils'

const props = defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<any>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<any>,
  class: {} as PropType<any>,
  foldable: Boolean,
})

const emit = defineEmits(['update:modelValue'])

const config = ref()
const choices = ref<Schema[]>()
const cache = ref<any[]>()
const active = ref<Schema>()
let stop: WatchStopHandle

const doWatch = () => watch(config, (value) => {
  const index = choices.value.indexOf(active.value)
  if (index >= 0) cache.value[index] = value
  emit('update:modelValue', deepEqual(value, props.schema.meta.default) ? undefined : value)
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
  for (const item of choices.value) {
    if (!check(item, value)) continue
    active.value = item
    break
  }
  stop = doWatch()
}, { immediate: true, deep: true })

const selectModel = computed({
  get() {
    if (active.value === props.schema) return
    return active.value?.meta.description || active.value?.value
  },
  set(index) {
    if (active.value === choices.value[index]) return
    config.value = cache.value[index]
    active.value = choices.value[index]
  },
})

</script>
