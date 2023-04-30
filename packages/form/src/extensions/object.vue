<template>
  <h2 class="k-schema-header" v-if="schema.meta.description">
    {{ schema.meta.description }}
  </h2>
  <k-schema
    v-for="(item, key) in schema.dict"
    :key="key"
    :modelValue="modelValue?.[key]"
    @update:modelValue="updateValue(key, $event)"
    :schema="item"
    :initial="initial?.[key]"
    :disabled="disabled"
    :prefix="prefix + key + '.'"
  >
    <span class="prefix">{{ prefix }}</span>
    <span>{{ key }}</span>
  </k-schema>
</template>

<script lang="ts" setup>

import { PropType } from 'vue'
import { Schema } from '../utils'

const props = defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<any>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<any>,
})

const emit = defineEmits(['update:modelValue'])

function updateValue(key: string, value: any) {
  const copy = { ...props.modelValue }
  copy[key] = value
  emit('update:modelValue', copy)
}

</script>
