<template>
  <schema-base>
    <template #title><slot name="title"></slot></template>
    <template #desc><slot name="desc"></slot></template>
    <template #menu>
      <slot name="menu"></slot>
      <div class="k-menu-separator"></div>
      <div class="k-menu-item" :class="{ disabled }" @click="selectAll">
        <span class="k-menu-icon"><icon-square-check></icon-square-check></span>
        {{ t('select.all') }}
      </div>
      <div class="k-menu-item" :class="{ disabled }" @click="selectNone">
        <span class="k-menu-icon"><icon-square-empty></icon-square-empty></span>
        {{ t('select.none') }}
      </div>
    </template>
    <template #prefix><slot name="prefix"></slot></template>
    <template #suffix><slot name="suffix"></slot></template>
    <ul class="bottom">
      <li v-for="item in items" :key="item.value">
        <el-checkbox
          :disabled="disabled || item.meta.disabled"
          :modelValue="values.includes(item.value)"
          @update:modelValue="toggle(item.value)"
        >
          {{ tt(item.meta.description) || item.value }}
          <k-badge :type="type" v-for="{ text, type } in item.meta.badges || []">
            {{ t('badge.' + text) }}
          </k-badge>
        </el-checkbox>
      </li>
    </ul>
  </schema-base>
</template>

<script lang="ts" setup>

import { PropType } from 'vue'
import { Schema, useI18n, useI18nText, useMultiSelect } from '../utils'
import SchemaBase from '../base.vue'
import { IconSquareCheck, IconSquareEmpty } from '../icons'

defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<number>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<{}>,
})

defineEmits(['update:modelValue'])

const { values, items, toggle, selectAll, selectNone } = useMultiSelect()

const t = useI18n()
const tt = useI18nText()

</script>
