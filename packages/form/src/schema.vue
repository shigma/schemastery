<template>
  <schema-component
    v-bind="$attrs"
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
      <div
        class="k-menu-item"
        @click="showJson = true">
        <span class="k-menu-icon"><icon-code></icon-code></span>
        {{ t('edit.json') }}
      </div>
      <component
        :is="slots.menu"
        v-bind="{ schema, modelValue, initial, disabled }"
        @update:modelValue="$emit('update:modelValue', $event)"
      ></component>
      <div
        class="k-menu-item"
        :class="{ disabled: disabled || deepEqual(initial, modelValue) }"
        @click="$emit('update:modelValue', clone(initial))">
        <span class="k-menu-icon"><icon-undo></icon-undo></span>
        {{ t('initial') }}
      </div>
      <div
        class="k-menu-item"
        :class="{ disabled: disabled || isNullable(modelValue) }"
        @click="$emit('update:modelValue', null)">
        <span class="k-menu-icon"><icon-reset></icon-reset></span>
        {{ t('default') }}
      </div>
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

  <el-dialog
    v-model="showJson"
    destroy-on-close
    append-to-body
    class="k-schema-edit-dialog"
    :title="t('edit.json')"
    @open="input?.focus()"
  >
    <el-input
      ref="input"
      type="textarea"
      :class="{ invalid: jsonError }"
      :autosize="{ minRows: 2, maxRows: 10 }"
      v-model="jsonInput"
    ></el-input>
    <template #footer>
      <div></div>
      <div>
        <el-button @click="copyToClipboard">{{ t('edit.copy') }}</el-button>
        <el-button
          type="primary"
          :disabled="!!jsonError"
          @click="saveChanges"
        >{{ t('edit.save') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>

import { computed, inject, PropType, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { clone, deepEqual, isNullable } from 'cosmokit'
import { ElMessage } from 'element-plus'
import { getFallback, Schema, useI18nText } from './utils'
import { IconCode, IconUndo, IconReset } from './icons'
import type form from '.'
import SchemaPrimitive from './primitive.vue'
import SchemaBase from './base.vue'
import zhCN from './locales/zh-CN.yml'
import enUS from './locales/en-US.yml'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  schema: {} as PropType<Schema>,
  initial: {} as PropType<any>,
  modelValue: {} as PropType<any>,
  extra: {} as PropType<any>,
  disabled: Boolean,
  branch: Boolean,
  prefix: { type: String, default: '' },
})

const extensions = inject<Set<form.Extension>>('__SCHEMASTERY_EXTENSIONS__')
const slots = inject<Record<string, Function>>('__SCHEMASTERY_SLOTS__')

const emit = defineEmits(['update:modelValue'])

const input = ref()
const showJson = ref(false)
const jsonInput = ref('')
const jsonError = ref('')

watch(() => props.modelValue, (value) => {
  jsonInput.value = JSON.stringify(value ?? getFallback(props.schema), null, 2)
}, { immediate: true })

watch(jsonInput, (value: string) => {
  jsonError.value = ''
  try {
    const config = JSON.parse(value)
    Schema(props.schema)(config)
  } catch (e) {
    jsonError.value = t('edit.invalid')
  }
})

async function copyToClipboard() {
  await navigator.clipboard.writeText(jsonInput.value)
  ElMessage.success(t('edit.copied'))
}

function saveChanges() {
  emit('update:modelValue', Schema(props.schema).simplify(JSON.parse(jsonInput.value)))
  showJson.value = false
}

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
      const valid = isNullable(props.modelValue) && !ext.important || ext.validate(props.modelValue, props.schema)
      if (!valid) return
    }
    return [ext.component, +!!ext.type + +!!ext.role + +ext.important * Infinity] as const
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
