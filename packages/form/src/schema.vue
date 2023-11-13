<template>
  <schema-component
    v-if="!schema?.meta.hidden && (extra?.foldable || (schema && schema.type !== 'const'))"
    :schema="schema"
    :prefix="prefix"
    :initial="initial"
    :disabled="disabled"
    :extra="extra"
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :class="{
      changed: extra?.changed ?? !deepEqual(initial, modelValue),
      required: extra?.required ?? (schema?.meta.required && isNullable(schema?.meta.default) && isNullable(modelValue)),
      invalid: extra?.invalid,
    }"
  >
    <template #title><slot name="title"></slot></template>
    <template #menu>
      <div class="k-menu-item" :class="{ disabled }" @click="$emit('update:modelValue', clone(initial))">
        <span class="k-menu-icon"><icon-undo></icon-undo></span>
        {{ t('initial') }}
      </div>
      <div class="k-menu-item" :class="{ disabled }" @click="$emit('update:modelValue', null)">
        <span class="k-menu-icon"><icon-reset></icon-reset></span>
        {{ t('default') }}
      </div>
      <slot name="menu"></slot>
    </template>
    <template #desc>
      <slot name="desc">
        <k-markdown :source="tt(schema?.meta.description)"></k-markdown>
      </slot>
    </template>
    <template #collapse><slot name="collapse"></slot></template>
    <template #prefix><slot name="prefix"></slot></template>
    <template #suffix><slot name="suffix"></slot></template>
    <template #control>
      <schema-primitive v-if="isPrimitive"
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
import { useI18n } from 'vue-i18n'
import { clone, deepEqual, isNullable } from 'cosmokit'
import extensions, { Schema, useI18nText } from './utils'
import { IconUndo, IconReset } from './icons'
import SchemaPrimitive from './primitive.vue'
import SchemaBase from './base.vue'
import zhCN from './locales/zh-CN.yml'
import enUS from './locales/en-US.yml'

const props = defineProps({
  schema: {} as PropType<Schema>,
  initial: {} as PropType<any>,
  modelValue: {} as PropType<any>,
  extra: {} as PropType<any>,
  disabled: Boolean,
  branch: Boolean,
  prefix: { type: String, default: '' },
})

defineEmits(['update:modelValue'])

const tt = useI18nText()

const disabled = computed(() => {
  return props.disabled || props.schema?.meta.disabled
})

const isPrimitive = computed(() => {
  return ['string', 'number', 'boolean'].includes(props.schema?.type)
    && (isNullable(props.modelValue) || typeof props.modelValue === props.schema.type)
})

const SchemaComponent = computed(() => {
  const candidates = [...extensions].map((ext) => {
    if (ext.type && props.schema?.type !== ext.type) return
    if (ext.role && props.schema?.meta.role !== ext.role) return
    if (ext.validate) {
      const valid = isNullable(props.modelValue) || ext.validate(props.modelValue, props.schema)
      if (!valid) return
    }
    return [ext.component, +!!ext.type + +!!ext.role] as const
  }).filter(Boolean).sort((a, b) => b[1] - a[1])
  candidates.push([SchemaBase, 0])
  return candidates[0][0]
})

const { t, setLocaleMessage } = useI18n({
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})

if (import.meta.hot) {
  import.meta.hot.accept('./locales/zh-CN.yml', (module) => {
    setLocaleMessage('zh-CN', module.default)
  })
  import.meta.hot.accept('./locales/en-US.yml', (module) => {
    setLocaleMessage('en-US', module.default)
  })
}

</script>
