<template>
  <schema-base>
    <template #header><slot name="header"></slot></template>
    <template #prefix><slot name="prefix"></slot></template>
    <template #suffix><slot name="suffix"></slot></template>
    <ul class="bottom">
      <li v-for="(value, key) in schema.bits" :key="value">
        <el-checkbox
          :disabled="disabled"
          :modelValue="!!(modelValue & value)"
          @update:modelValue="$emit('update:modelValue', modelValue ^ value)"
        >{{ key }}</el-checkbox>
      </li>
    </ul>
  </schema-base>
</template>

<script lang="ts" setup>

import { PropType } from 'vue'
import { Schema } from '../utils'
import SchemaBase from '../base.vue'

defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<number>,
  disabled: {} as PropType<boolean>,
})

defineEmits(['update:modelValue'])

</script>
