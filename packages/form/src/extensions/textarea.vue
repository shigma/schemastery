<template>
  <schema-base>
    <template #header><slot name="header"></slot></template>
    <template #prefix><slot name="prefix"></slot></template>
    <template #suffix><slot name="suffix"></slot></template>
    <div class="bottom">
      <el-input
        autosize
        type="textarea"
        :disabled="disabled"
        :modelValue="modelValue"
        @update:modelValue="$emit('update:modelValue', $event)"
      ></el-input>
    </div>
  </schema-base>
</template>

<script lang="ts" setup>

import { PropType } from 'vue'
import { Schema } from '../utils'
import SchemaBase from '../base.vue'

defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<string>,
  disabled: {} as PropType<boolean>,
})

defineEmits(['update:modelValue'])

</script>
