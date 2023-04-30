<template>
  <h2 class="k-schema-header" v-if="schema.meta.description">
    {{ schema.meta.description }}
  </h2>
  <k-schema
    v-for="(item, key) in schema.dict"
    :key="key"
    v-model="config[key]"
    :schema="item"
    :initial="initial?.[key]"
    :disabled="disabled"
    :prefix="prefix + key + '.'"
    #title
  >
    <span class="prefix">{{ prefix }}</span>
    <span>{{ key }}</span>
  </k-schema>
</template>

<script lang="ts" setup>

import { PropType } from 'vue'
import { Schema, useConfig } from '../utils'

defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<any>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<any>,
  class: {} as PropType<any>,
})

defineEmits(['update:modelValue'])

const config = useConfig()

</script>
