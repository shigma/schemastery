<template>
  <schema-base>
    <template #header><slot name="header"></slot></template>
    <template #prefix><slot name="prefix"></slot></template>
    <template #suffix><slot name="suffix"></slot></template>
    <ul class="bottom">
      <li v-for="item in getChoices(schema)" :key="item.value">
        <el-radio
          :label="item.value"
          :disabled="disabled"
          :modelValue="modelValue"
          @update:modelValue="$emit('update:modelValue', $event)"
        >{{ item.meta.description || item.value }}</el-radio>
      </li>
    </ul>
  </schema-base>
</template>

<script lang="ts" setup>

import { PropType } from 'vue'
import { getChoices, Schema } from '../utils'
import SchemaBase from '../base.vue'

defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<any>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<{}>,
})

defineEmits(['update:modelValue'])

</script>
