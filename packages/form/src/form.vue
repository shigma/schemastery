<template>
  <form class="k-form">
    <slot name="prolog"></slot>
    <h2 class="k-schema-header" v-if="showHeader || !hasTitle(resolved)">
      <slot name="title">{{ t('title') }}</slot>
    </h2>
    <k-schema
      v-model="config"
      :initial="initial"
      :schema="resolved"
      :disabled="disabled"
    ></k-schema>
    <slot name="epilog"></slot>
  </form>
</template>

<script lang="ts" setup>

import { computed, PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { getChoices, Schema } from './utils'
import zhCN from './locales/zh-CN.yml'
import enUS from './locales/en-US.yml'

const props = defineProps({
  schema: {} as PropType<Schema>,
  initial: {},
  modelValue: {},
  disabled: Boolean,
  showHeader: Boolean,
})

const resolved = computed(() => {
  return props.schema && new Schema(props.schema)
})

function hasTitle(schema: Schema): boolean {
  if (!schema) return true
  if (schema.type === 'object') {
    if (schema.meta.description) return true
    const entries = Object.entries(schema.dict).filter(([, value]) => !value.meta.hidden)
    if (!entries.length) return true
    return hasTitle(schema.dict[entries[0][0]])
  } else if (schema.type === 'intersect') {
    return hasTitle(schema.list[0])
  } else if (schema.type === 'union') {
    const choices = getChoices(schema)
    return choices.length === 1 ? hasTitle(choices[0]) : false
  } else {
    return false
  }
}

const emit = defineEmits(['update:modelValue'])

const config = computed({
  get: () => props.modelValue,
  set: emit.bind(null, 'update:modelValue'),
})

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

<style lang="scss">

@media screen and (max-width: 480px) {
  .k-form {
    margin: 0 -1.5rem;

    .k-schema-header {
      padding: 0 1.5rem;
    }

    .k-schema-item {
      padding: 0.5rem 1.5rem;

      .k-schema-main {
        display: block;
        min-height: unset;
      }

      .k-schema-right {
        display: block;

        > :first-child {
          margin-top: 0.25rem;
        }

        > :last-child {
          margin-bottom: 0.25rem;
        }
      }
    }
  }
}

</style>
