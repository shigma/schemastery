<template>
  <form class="k-form">
    <slot name="prolog"></slot>
    <h2 class="k-schema-header" v-if="showHeader || !hasTitle(resolved)[0]">
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
import { getChoices, Schema, useI18nText } from './utils'
import zhCN from './locales/zh-CN.yml'
import enUS from './locales/en-US.yml'

const props = defineProps({
  schema: {} as PropType<Schema>,
  initial: {},
  modelValue: {},
  disabled: Boolean,
  showHeader: Boolean,
})

const tt = useI18nText()

const resolved = computed(() => {
  return props.schema && new Schema(props.schema)
})

function hasTitleInList(list: Schema[]): [isTitled: boolean, isEmpty: boolean] {
  for (const item of list) {
    const [isTitled, isEmpty] = hasTitle(item)
    if (!isTitled) return [false, false]
    if (!isEmpty) return [true, false]
  }
  return [true, true]
}

function hasTitle(schema: Schema): [isTitled: boolean, isEmpty: boolean] {
  if (!schema) return [true, true]
  if (schema.meta.hidden) return [true, true]
  if (schema.type === 'object') {
    if (tt(schema.meta.description)) return [true, false]
    return hasTitleInList(Object.entries(schema.dict)
      .filter(([, value]) => !value.meta.hidden)
      .map(([, value]) => value))
  } else if (schema.type === 'intersect') {
    return hasTitleInList(schema.list)
  } else if (schema.type === 'union') {
    const choices = getChoices(schema)
    return choices.length === 1 ? hasTitle(choices[0]) : [false, false]
  } else {
    return [false, false]
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

.k-form {
  &:not(:first-child) {
    margin-top: 2rem;
  }
}

@media screen and (max-width: 480px) {
  .k-form {
    margin: 0 -1.5rem;

    .k-schema-header {
      padding: 0 1.5rem;
    }

    .k-schema-item {
      padding: 0.5rem 1.5rem;

      .k-schema-main {
        min-height: unset;
        grid-template-columns: auto 2rem;
        grid-template-rows: auto auto;
      }

      .k-schema-right {
        display: block;
        grid-column: 1 / 2;
        grid-row: 2;

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
