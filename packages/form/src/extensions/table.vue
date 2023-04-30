<template>
  <schema-base>
    <template #header><slot name="header"></slot></template>
    <template #prefix><slot name="prefix"></slot></template>
    <template #suffix><slot name="suffix"></slot></template>
    <template #control>
      <el-button type="primary" @click="addEntry" :disabled="disabled">添加项</el-button>
    </template>
    <table class="bottom schema-table" v-if="entries.length">
      <tr v-for="([key], index) in entries">
        <td class="key" v-if="schema.type === 'dict'">
          <el-input
            v-model="entries[index][0]"
            :disabled="disabled"
            :class="{ invalid: entries.filter(e => e[0] === key).length > 1 }"
          ></el-input>
        </td>
        <td>
          <el-input
            v-model="entries[index][1]"
            :disabled="disabled"
            :type="schema.inner.type === 'number' ? 'number' : 'text'"
            :max="schema.inner.meta.max"
            :min="schema.inner.meta.min"
            :step="schema.inner.meta.step"
          ></el-input>
        </td>
        <td class="close">
          <div class="inner" :class="{ disabled }" @click.stop="deleteEntry(index)">
            <icon-close></icon-close>
          </div>
        </td>
      </tr>
    </table>
  </schema-base>
</template>

<script lang="ts" setup>

import { PropType, ref, watch, WatchStopHandle } from 'vue'
import { IconClose } from '../icons'
import { getFallback, Schema, useEntries } from '../utils'
import SchemaBase from '../base.vue'

const props = defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {} as PropType<{}>,
  disabled: {} as PropType<boolean>,
  prefix: {} as PropType<string>,
  initial: {} as PropType<{}>,
})

const emit = defineEmits(['update:modelValue'])

const entries = useEntries()

function addEntry() {
  entries.value.push(['', getFallback(props.schema.inner, true)])
}

function deleteEntry(index: number) {
  if (props.disabled) return
  entries.value.splice(index, 1)
}

</script>

<style lang="scss">

.schema-table {
  tr {
    border-left: 1px solid var(--el-border-color);
    border-right: 1px solid var(--el-border-color);
  }

  td {
    padding: 0;

    .el-input.invalid {
      --el-input-border-color: var(--el-color-warning);
    }

    .el-input__wrapper {
      z-index: 1;
      border-radius: 0;
    }
  }

  td.key {
    width: 30%;
  }

  td.close {
    width: 2rem;

    .inner {
      height: 2rem;
      box-sizing: border-box;
      border: 1px solid var(--el-border-color);
      display: flex;
      justify-content: center;
      align-items: center;
      color: var(--fg3);
      transition: var(--color-transition);
      cursor: pointer;
    }

    .inner.disabled {
      pointer-events: none;
    }

    .inner:hover {
      color: var(--fg1);
    }

    .k-icon {
      height: 1rem;
    }
  }
}

</style>
