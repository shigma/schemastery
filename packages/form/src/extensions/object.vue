<template>
  <define-template>
    <k-schema
      v-for="(item, key) in schema.dict"
      :key="key"
      :modelValue="config[key]"
      @update:modelValue="config[key] = $event ?? undefined"
      :schema="item"
      :initial="initial?.[key]"
      :disabled="disabled"
      :prefix="prefix + key + '.'"
      #title
    >
      <span class="prefix">{{ prefix }}</span>
      <span>{{ key }}</span>
      <k-badge :type="type" v-for="{ text, type } in item.meta.badges || []">
        {{ t('badge.' + text) }}
      </k-badge>
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

import { PropType, computed } from 'vue'
import { createReusableTemplate } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { Schema, useModel, useI18nText } from '../utils'
import SchemaBase from '../base.vue'
import zhCN from '../locales/zh-CN.yml'
import enUS from '../locales/en-US.yml'

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

const config = useModel()

const description = computed(() => tt(props.schema.meta.description))

const { t, setLocaleMessage } = useI18n({
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})

if (import.meta.hot) {
  import.meta.hot.accept('../locales/zh-CN.yml', (module) => {
    setLocaleMessage('zh-CN', module.default)
  })
  import.meta.hot.accept('../locales/en-US.yml', (module) => {
    setLocaleMessage('en-US', module.default)
  })
}

</script>
