<template>
  <schema-base>
    <template #title><slot name="title"></slot></template>
    <template #desc><slot name="desc"></slot></template>
    <template #prefix><slot name="prefix"></slot></template>
    <template #suffix><slot name="suffix"></slot></template>
    <ul class="bottom">
      <li v-for="item in getChoices(schema)" :key="item.value">
        <el-radio
          :label="item.value"
          :disabled="disabled"
          v-model="config"
        >{{ item.meta.description || item.value }}</el-radio>
      </li>
    </ul>
  </schema-base>
</template>

<script lang="ts" setup>

import { PropType } from 'vue'
import { getChoices, Schema, useConfig } from '../utils'
import SchemaBase from '../base.vue'

defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<any>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<{}>,
})

defineEmits(['update:modelValue'])

const config = useConfig()

</script>
