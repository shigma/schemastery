<template>
  <k-schema
    v-model="config"
    :schema="active"
    :initial="initial"
    :disabled="disabled"
    :prefix="prefix"
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

import { computed, PropType, ref, watch } from 'vue'
import { check, deepEqual, getChoices, getFallback, Schema } from '../utils'

const props = defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<any>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<any>,
  class: {} as PropType<any>,
})

const emit = defineEmits(['update:modelValue'])

const config = ref()
const choices = ref<Schema[]>()
const cache = ref<any[]>()
const active = ref<Schema>()

watch(() => props.schema, (value) => {
  if (!value?.list) {
    choices.value = []
    return
  }
  choices.value = getChoices(props.schema)
  cache.value = choices.value.map((item) => {
    if (item.type === 'const') return item.value
    return getFallback(item, true)
  })
}, { immediate: true })

watch(() => [props.modelValue, props.schema] as const, ([value, schema]) => {
  config.value = value ?? getFallback(schema)
  active.value = schema
  for (const item of choices.value) {
    if (!check(item, config.value)) continue
    active.value = item
    break
  }
}, { immediate: true, deep: true })

watch(config, (value) => {
  if (!props.schema) return
  if (deepEqual(value, props.schema.meta.default)) {
    emit('update:modelValue', undefined)
  } else {
    emit('update:modelValue', value)
  }
}, { deep: true })

const selectModel = computed({
  get() {
    if (active.value === props.schema) return
    return active.value.meta.description || active.value.value
  },
  set(index) {
    if (active.value === choices.value[index]) return
    config.value = cache.value[index]
    active.value = choices.value[index]
  },
})

</script>
