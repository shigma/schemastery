<template>
  <schema-base>
    <template #title><slot name="title"></slot></template>
    <template #desc><slot name="desc"></slot></template>
    <template #menu><slot name="menu"></slot></template>
    <template #prefix v-if="valid">
      <slot name="prefix"></slot>
    </template>
    <template #suffix v-if="valid">
      <slot name="suffix"></slot>
    </template>
    <template #control v-if="valid">
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

import { computed, PropType } from 'vue'
import { Schema, useModel } from '../utils'
import SchemaBase from '../base.vue'
import SchemaPrimitive from '../primitive.vue'

const props = defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<any[]>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<{}>,
})

defineEmits(['update:modelValue'])

const config = useModel()

const valid = computed(() => {
  return props.schema.list.every(item => ['string', 'number', 'boolean'].includes(item.type))
})

</script>
