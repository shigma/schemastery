<template>
  <schema-base>
    <template #header><slot name="header"></slot></template>
    <template #prefix><slot name="prefix"></slot></template>
    <template #suffix><slot name="suffix"></slot></template>
    <div class="bottom">
      <el-input
        type="textarea"
        :autosize="autosize"
        :disabled="disabled"
        :modelValue="modelValue"
        @update:modelValue="$emit('update:modelValue', $event)"
      ></el-input>
    </div>
  </schema-base>
</template>

<script lang="ts" setup>

import { computed, PropType } from 'vue'
import { Schema } from '../utils'
import SchemaBase from '../base.vue'

const props = defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<string>,
  disabled: {} as PropType<boolean>,
})

defineEmits(['update:modelValue'])

const autosize = computed(() => {
  const { rows } = props.schema.meta.extra || {}
  if (typeof rows === 'number') return { minRows: rows, maxRows: rows }
  if (Array.isArray(rows)) return { minRows: rows[0], maxRows: rows[1] }
  return true
})

</script>
