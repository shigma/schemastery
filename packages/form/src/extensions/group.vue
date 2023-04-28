<template>
  <schema-base>
    <template #header><slot name="header"></slot></template>
    <template #prefix><slot name="prefix"></slot></template>
    <template #suffix><slot name="suffix"></slot></template>
    <template #control>
      <el-button solid @click="handleCommand('add')" :disabled="disabled">添加项</el-button>
    </template>
  </schema-base>
  <div class="k-schema-group">
    <template v-for="([key, _], index) in entries" :key="index">
      <template v-if="isObjectSchema(schema.inner)">
        <schema-base @command="handleCommand($event, index)"
          :class="{ invalid: entries.filter(e => e[0] === key).length > 1 }" #header>
          <schema-header>
            <template #title v-if="schema.type === 'array'">
              <span class="prefix">{{ prefix.slice(0, -1) }}</span>
              <span>[{{ key }}]</span>
            </template>
            <template #title v-else>
              <span class="prefix">{{ prefix }}</span>
              <el-input v-model="entries[index][0]"></el-input>
            </template>
            <template #description>
              <k-markdown :source="schema.inner.meta.description"></k-markdown>
            </template>
            <template #menu>
              <el-dropdown-item divided :disabled="!index" command="up">上移项目</el-dropdown-item>
              <el-dropdown-item :disabled="index === entries.length - 1" command="down">下移项目</el-dropdown-item>
              <el-dropdown-item command="delete">删除项目</el-dropdown-item>
            </template>
          </schema-header>
        </schema-base>

        <div class="k-schema-group">
          <k-schema
            v-model="entries[index][1]"
            :initial="initial?.[key]"
            :schema="{ ...schema.inner, meta: { ...schema.inner.meta, description: '' } }"
            :disabled="disabled"
            :instant="instant"
            :prefix="schema.type === 'array' ? `${prefix.slice(0, -1)}[${key}].` : prefix + key + '.'">
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
        :instant="instant"
        :prefix="schema.type === 'array' ? `${prefix.slice(0, -1)}[${key}].` : prefix + key + '.'"
        @command="handleCommand($event, index)">
        <template #menu>
          <el-dropdown-item divided :disabled="!index" command="up">上移</el-dropdown-item>
          <el-dropdown-item :disabled="index === entries.length - 1" command="down">下移</el-dropdown-item>
          <el-dropdown-item command="delete">删除</el-dropdown-item>
        </template>
        <template #default v-if="schema.type === 'array'">
          <span class="prefix">{{ prefix.slice(0, -1) }}</span>
          <span>[{{ key }}]</span>
        </template>
        <template #default v-else>
          <span class="prefix">{{ prefix }}</span>
          <el-input v-model="entries[index][0]"></el-input>
        </template>
      </k-schema>
    </template>
  </div>
</template>

<script lang="ts" setup>

import { PropType, ref, watch, WatchStopHandle } from 'vue'
import { getFallback, isObjectSchema, Schema } from '../utils'
import SchemaBase from '../base.vue'
import SchemaHeader from '../header.vue'

const props = defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<{}>,
  disabled: {} as PropType<boolean>,
  initial: {} as PropType<{}>,
  prefix: {} as PropType<string>,
})

const emit = defineEmits(['update:modelValue'])

function handleCommand(action: string, index?: number) {
  if (action === 'down') {
    if (props.schema.type === 'dict') {
      entries.value.splice(index + 1, 0, ...entries.value.splice(index, 1))
    } else {
      const temp = entries.value[index][1]
      entries.value[index][1] = entries.value[index + 1][1]
      entries.value[index + 1][1] = temp
    }
  } else if (action === 'up') {
    if (props.schema.type === 'dict') {
      entries.value.splice(index - 1, 0, ...entries.value.splice(index, 1))
    } else {
      const temp = entries.value[index][1]
      entries.value[index][1] = entries.value[index - 1][1]
      entries.value[index - 1][1] = temp
    }
  } else if (action === 'delete') {
    entries.value.splice(index, 1)
  } else if (action === 'add') {
    entries.value.push(['', getFallback(props.schema.inner, true)])
  }
}

const entries = ref<any[]>()

let stop: WatchStopHandle

watch(() => props.modelValue, (value) => {
  stop?.()
  entries.value = Object.entries(value || {})
  stop = doWatch()
}, { immediate: true, deep: true })

function doWatch() {
  return watch(entries, () => {
    if (props.schema.type === 'dict') {
      const result: any = {}
      for (const [key, value] of entries.value) {
        if (key in result) return
        result[key] = value
      }
      emit('update:modelValue', result)
    } else {
      emit('update:modelValue', entries.value.map(([, value]) => value))
    }
  }, { deep: true })
}

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
