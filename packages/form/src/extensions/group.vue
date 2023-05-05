<template>
  <schema-base v-bind="$attrs">
    <template #title><slot name="title"></slot></template>
    <template #desc><slot name="desc"></slot></template>
    <template #menu><slot name="menu"></slot></template>
    <template #prefix><slot name="prefix"></slot></template>
    <template #suffix><slot name="suffix"></slot></template>
    <template #control>
      <el-button @click="add()" :disabled="disabled">添加项目</el-button>
    </template>
    <template #collapse>
      <k-schema
        v-for="([key, _], index) in entries"
        :key="index"
        v-model="entries[index][1]"
        :initial="(initial ?? schema.meta.default)[key]"
        :schema="schema.inner"
        :disabled="disabled"
        :prefix="schema.type === 'array' ? `${prefix.slice(0, -1)}[${key}].` : prefix + key + '.'"
        :extra="{
          foldable: true,
          changed: key in (initial ?? schema.meta.default) ? undefined : true,
          invalid: entries.filter(e => e[0] === key).length > 1,
        }"
      >
        <template #menu>
          <el-dropdown-item divided :disabled="!index" @click="up(index)">上移项目</el-dropdown-item>
          <el-dropdown-item :disabled="index === entries.length - 1" @click="down(index)">下移项目</el-dropdown-item>
          <el-dropdown-item @click="del(index)">删除项目</el-dropdown-item>
        </template>
        <template #title>
          <span class="prefix">{{ prefix.slice(0, -1) }}</span>
          <template v-if="schema.type === 'array'">[{{ key }}]</template>
          <template v-else>
            ['
            <span class="entry-input">
              <span class="shadow" v-if="entries[index][0]">{{ entries[index][0] }}</span>
              <span class="placeholder" v-else>&nbsp;</span>
              <input v-model="entries[index][0]"/>
            </span>
            ']
          </template>
        </template>
      </k-schema>
    </template>
  </schema-base>
</template>

<script lang="ts" setup>

import { PropType } from 'vue'
import { Schema, useEntries } from '../utils'
import SchemaBase from '../base.vue'

defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<any>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<any>,
  extra: {} as PropType<any>,
})

defineEmits(['update:modelValue'])

const { entries, up, down, add, del } = useEntries()

</script>

<style lang="scss" scoped>

.entry-input {
  position: relative;

  .shadow {
    visibility: hidden;
    white-space: pre;
  }

  .placeholder {
    min-width: 2rem;
    display: inline-block;
  }

  input {
    position: absolute;
    left: -.5em;
    right: -.5em;
    border: none;
    padding: 0 .5em;
    margin: 0;
    font-size: 1em;
    font-weight: inherit;
    font-family: inherit;
    border-radius: 0;
    outline: none;
  }
}

</style>
