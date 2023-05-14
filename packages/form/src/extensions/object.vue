<template>
  <schema-base v-if="extra?.foldable" v-bind="$attrs">
    <template #title><slot name="title"></slot></template>
    <template #desc>
      <slot name="desc">
        <k-markdown :source="description"></k-markdown>
      </slot>
    </template>
    <template #menu><slot name="menu"></slot></template>
    <template #prefix><slot name="prefix"></slot></template>
    <template #suffix><slot name="suffix"></slot></template>
  </schema-base>
  <h2 class="k-schema-header" v-else-if="description">
    {{ description }}
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

<script lang="ts">

export default {
  inheritAttrs: false,
}

</script>

<script lang="ts" setup>

import { PropType, computed } from 'vue'
import { Schema, useConfig, useI18nText } from '../utils'
import SchemaBase from '../base.vue'

const props = defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<any>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<any>,
  extra: {} as PropType<any>,
})

defineEmits(['update:modelValue'])

const tt = useI18nText()

const config = useConfig()

const description = computed(() => tt(props.schema.meta.description))

</script>
