<template>
  <schema-base v-bind="$attrs">
    <template #title><slot name="title"></slot></template>
    <template #desc><slot name="desc"></slot></template>
    <template #prefix><slot name="prefix"></slot></template>
    <template #suffix><slot name="suffix"></slot></template>
    <template #control>
      <el-button type="primary" @click="add()" :disabled="disabled">添加项</el-button>
    </template>
  </schema-base>
  <div class="k-schema-group">
    <template v-for="([key, _], index) in entries" :key="index">
      <template v-if="isObjectSchema(schema.inner)">
        <schema-base
          :class="{ invalid: entries.filter(e => e[0] === key).length > 1 }">
          <template #title v-if="schema.type === 'array'">
            <span class="prefix">{{ prefix.slice(0, -1) }}</span>
            <span>[{{ key }}]</span>
          </template>
          <template #title v-else>
            <span class="prefix">{{ prefix }}</span>
            <el-input v-model="entries[index][0]"></el-input>
          </template>
          <template #desc>
            <k-markdown :source="schema.inner.meta.description"></k-markdown>
          </template>
          <template #menu>
            <el-dropdown-item divided :disabled="!index" @click="up(index)">上移</el-dropdown-item>
            <el-dropdown-item :disabled="index === entries.length - 1" @click="down(index)">下移</el-dropdown-item>
            <el-dropdown-item @click="del(index)">删除</el-dropdown-item>
          </template>
        </schema-base>

        <div class="k-schema-group">
          <k-schema
            v-model="entries[index][1]"
            :initial="initial?.[key]"
            :schema="{ ...schema.inner, meta: { ...schema.inner.meta, description: '' } }"
            :disabled="disabled"
            :prefix="schema.type === 'array' ? `${prefix.slice(0, -1)}[${key}].` : prefix + key + '.'"
            #title>
            <span class="prefix">{{ prefix }}</span>
            <span>{{ key }}</span>
          </k-schema>
        </div>
      </template>

      <k-schema v-else
        v-model="entries[index][1]"
        :invalid="entries.filter(e => e[0] === key).length > 1"
        :initial="initial?.[key]"
        :schema="schema.inner"
        :disabled="disabled"
        :prefix="schema.type === 'array' ? `${prefix.slice(0, -1)}[${key}].` : prefix + key + '.'">
        <template #menu>
          <el-dropdown-item divided :disabled="!index" @click="up(index)">上移</el-dropdown-item>
          <el-dropdown-item :disabled="index === entries.length - 1" @click="down(index)">下移</el-dropdown-item>
          <el-dropdown-item @click="del(index)">删除</el-dropdown-item>
        </template>
        <template #title v-if="schema.type === 'array'">
          <span class="prefix">{{ prefix.slice(0, -1) }}</span>
          <span>[{{ key }}]</span>
        </template>
        <template #title v-else>
          <span class="prefix">{{ prefix }}</span>
          <el-input v-model="entries[index][0]"></el-input>
        </template>
      </k-schema>
    </template>
  </div>
</template>

<script lang="ts" setup>

import { PropType } from 'vue'
import { isObjectSchema, Schema, useEntries } from '../utils'
import SchemaBase from '../base.vue'

defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<any>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<any>,
})

defineEmits(['update:modelValue'])

const { entries, up, down, add, del } = useEntries()

</script>

<style lang="scss">

.schema-item h3 {
  > .el-input {
    max-width: 12rem;

    input {
      border: none;
      padding: 0;
      font-size: 1rem;
      font-weight: inherit;
      font-family: inherit;
      border-radius: 0;
    }
  }
}

.k-schema-group + h2 {
  margin-top: 2rem;
}

</style>
