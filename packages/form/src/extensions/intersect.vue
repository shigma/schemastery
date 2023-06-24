<template>
  <k-schema
    v-for="(item, index) in getChoices(schema)"
    :key="index"
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :schema="{ ...item, meta: { ...schema.meta, ...item.meta } }"
    :initial="initial"
    :disabled="disabled"
    :prefix="prefix"
    :extra="{ foldable: false, ...extra }"
  >
    <template #title><slot name="title"></slot></template>
    <template #prefix><slot name="prefix"></slot></template>
    <template #suffix><slot name="suffix"></slot></template>
  </k-schema>
</template>

<script lang="ts" setup>

import { PropType } from 'vue'
import { getChoices, Schema } from '../utils'

defineOptions({
  inheritAttrs: false,
})

defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<any>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<any>,
  extra: {} as PropType<any>,
})

defineEmits(['update:modelValue'])

</script>
