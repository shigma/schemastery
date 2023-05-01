<template>
  <schema-component
    v-if="!schema?.meta.hidden"
    :schema="schema"
    :prefix="prefix"
    :initial="initial"
    :disabled="disabled"
    :foldable="foldable"
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :class="{
      changed: !deepEqual(initial, modelValue),
      required: extra?.required ?? (schema?.meta.required && isNullable(schema?.meta.default) && isNullable(modelValue)),
      invalid,
    }"
  >
    <template #title><slot name="title"></slot></template>
    <template #menu>
      <el-dropdown-item @click="$emit('update:modelValue', clone(initial))">撤销更改</el-dropdown-item>
      <el-dropdown-item @click="$emit('update:modelValue', null)">恢复默认值</el-dropdown-item>
      <slot name="menu"></slot>
    </template>
    <template #desc>
      <slot name="desc">
        <k-markdown :source="schema?.meta.description"></k-markdown>
      </slot>
    </template>
    <template #prefix><slot name="prefix"></slot></template>
    <template #suffix><slot name="suffix"></slot></template>
    <template #control>
      <schema-primitive v-if="['string', 'number', 'boolean'].includes(schema?.type)"
        :schema="schema"
        :disabled="disabled"
        :modelValue="modelValue"
        @update:modelValue="$emit('update:modelValue', $event)"
      ></schema-primitive>
    </template>
  </schema-component>
</template>

<script lang="ts" setup>

import { computed, PropType } from 'vue'
import { clone, deepEqual, isNullable, Schema } from './utils'
import form from '.'
import SchemaPrimitive from './primitive.vue'
import SchemaBase from './base.vue'

const props = defineProps({
  schema: {} as PropType<Schema>,
  initial: {} as PropType<any>,
  modelValue: {},
  invalid: Boolean,
  extra: {} as PropType<any>,
  disabled: Boolean,
  foldable: Boolean,
  branch: Boolean,
  prefix: { type: String, default: '' },
})

defineEmits(['update:modelValue'])

const SchemaComponent = computed(() => {
  const candidates = [...form.extensions].map((ext) => {
    if (ext.type && props.schema?.type !== ext.type) return
    if (ext.role && props.schema?.meta.role !== ext.role) return
    return [ext.component, +!!ext.type + +!!ext.role] as const
  }).filter(Boolean).sort((a, b) => b[1] - a[1])
  candidates.push([SchemaBase, 0])
  return candidates[0][0]
})

</script>

<style lang="scss">

.k-schema-header {
  font-size: 1.25rem;

  .el-button {
    float: right;
    transform: translateY(-2px);
  }
}

.k-schema-group {
  position: relative;
  padding-left: 1rem;
  border-bottom: 1px solid var(--el-border-color-light);

  &:empty {
    border-bottom: none;
  }

  > :first-child {
    border-top: none;
  }

  > :last-child {
    border-bottom: none;
  }
}

</style>
