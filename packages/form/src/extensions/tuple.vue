<template>
  <schema-base>
    <template #header><slot name="header"></slot></template>
    <template #prefix><slot name="prefix"></slot></template>
    <template #suffix><slot name="suffix"></slot></template>
    <template #control>
      <schema-primitive
        v-for="(item, index) in schema.list"
        :key="index"
        :schema="item"
        :disabled="disabled"
        :modelValue="modelValue[index]"
        @update:modelValue="updateValue(index, $event)"
      ></schema-primitive>
    </template>
  </schema-base>
</template>

<script lang="ts" setup>

import { PropType } from 'vue'
import { Schema } from '../utils'
import SchemaBase from '../base.vue'
import SchemaPrimitive from '../primitive.vue'

const props = defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<any[]>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<{}>,
})

const emit = defineEmits(['update:modelValue'])

function updateValue(index: number, value: any) {
  const copy = [...props.modelValue]
  copy[index] = value
  emit('update:modelValue', copy)
}

</script>
