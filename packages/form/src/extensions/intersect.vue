<template>
  <define-template>
    <k-schema
      v-for="(item, index) in getChoices(schema)"
      :key="index"
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue', $event)"
      :schema="extra?.foldable ? item : { ...item, meta: { ...schema.meta, ...item.meta } }"
      :initial="initial"
      :disabled="disabled"
      :prefix="prefix"
      :extra="{ foldable: false }"
    >
      <template #title><slot name="title"></slot></template>
      <template #prefix><slot name="prefix"></slot></template>
      <template #suffix><slot name="suffix"></slot></template>
    </k-schema>
  </define-template>

  <schema-base
    v-if="extra?.foldable ?? schema.meta.collapse"
    v-bind="$attrs"
    :collapsible="{ initial: schema.meta.collapse }">
    <template #title><slot name="title"></slot></template>
    <template #desc>
      <slot name="desc">
        <k-markdown :source="description"></k-markdown>
      </slot>
    </template>
    <template #menu><slot name="menu"></slot></template>
    <template #prefix><slot name="prefix"></slot></template>
    <template #suffix><slot name="suffix"></slot></template>
    <template #collapse>
      <reuse-template></reuse-template>
    </template>
  </schema-base>

  <template v-else>
    <h2 class="k-schema-header" v-if="description">
      {{ description }}
    </h2>
    <reuse-template></reuse-template>
  </template>
</template>

<script lang="ts" setup>

import { computed, PropType } from 'vue'
import { createReusableTemplate } from '@vueuse/core'
import { getChoices, Schema, useI18nText } from '../utils'
import SchemaBase from '../base.vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<any>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<any>,
  extra: {} as PropType<any>,
})

defineEmits(['update:modelValue'])

const [DefineTemplate, ReuseTemplate] = createReusableTemplate()

const tt = useI18nText()

const description = computed(() => tt(props.schema.meta.description))

</script>
