<template>
  <schema-base>
    <template #title><slot name="title"></slot></template>
    <template #desc><slot name="desc"></slot></template>
    <template #menu><slot name="menu"></slot></template>
    <template #prefix><slot name="prefix"></slot></template>
    <template #suffix><slot name="suffix"></slot></template>
    <template #control>
      <schema-primitive
        v-for="(item, index) in schema.list"
        :key="index"
        :schema="item"
        :disabled="disabled"
        v-model="config[index]"
      ></schema-primitive>
    </template>
  </schema-base>
</template>

<script lang="ts" setup>

import { PropType } from 'vue'
import { Schema, useConfig } from '../utils'
import SchemaBase from '../base.vue'
import SchemaPrimitive from '../primitive.vue'

const props = defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<any[]>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<{}>,
  foldable: Boolean,
})

const emit = defineEmits(['update:modelValue'])

const config = useConfig()

</script>
