<template>
  <schema-base>
    <template #header><slot name="header"></slot></template>
    <ul class="bottom">
      <li v-for="item in schema.list" :key="item.value">
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
import { Schema } from '../utils'
import SchemaBase from '../base.vue'

defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<number>,
  disabled: {} as PropType<boolean>,
})

defineEmits(['update:modelValue'])

</script>
