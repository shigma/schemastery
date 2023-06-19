<template>
  <schema-base>
    <template #title><slot name="title"></slot></template>
    <template #desc><slot name="desc"></slot></template>
    <template #menu><slot name="menu"></slot></template>
    <template #prefix><slot name="prefix"></slot></template>
    <template #suffix><slot name="suffix"></slot></template>
    <div class="bottom">
      <el-input
        type="textarea"
        v-model="config"
        :autosize="autosize"
        :disabled="disabled"
      ></el-input>
    </div>
  </schema-base>
</template>

<script lang="ts" setup>

import { computed, PropType } from 'vue'
import { Schema, useModel } from '../utils'
import SchemaBase from '../base.vue'

const props = defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<string>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<{}>,
})

defineEmits(['update:modelValue'])

const config = useModel()

const autosize = computed(() => {
  const { rows } = props.schema.meta.extra || {}
  if (typeof rows === 'number') return { minRows: rows, maxRows: rows }
  if (Array.isArray(rows)) return { minRows: rows[0], maxRows: rows[1] }
  return true
})

</script>
