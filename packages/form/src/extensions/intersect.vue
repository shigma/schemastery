<template>
  <k-schema
    v-for="(item, index) in getChoices(schema)"
    :key="index"
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :branch="true"
    :schema="{ ...item, meta: { ...schema.meta, ...item.meta } }"
    :initial="initial"
    :disabled="disabled"
    :prefix="prefix"
  >
    <template #title><slot name="title"></slot></template>
    <template #suffix><slot name="suffix"></slot></template>
  </k-schema>
</template>

<script lang="ts" setup>

import { PropType } from 'vue'
import { getChoices, Schema } from '../utils'

defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<any>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<any>,
  class: {} as PropType<any>,
})

defineEmits(['update:modelValue'])

</script>
