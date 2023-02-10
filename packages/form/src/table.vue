<template>
  <table class="schema-table" v-if="entries.length">
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
</template>

<script lang="ts" setup>

import { getFallback, Schema } from './utils'
import { ref, watch, WatchStopHandle } from 'vue'
import { IconClose } from './icons'

const props = defineProps<{
  schema: Schema
  signal?: boolean
  modelValue: any
  disabled?: boolean
}>()

const emit = defineEmits(['update:modelValue', 'update:signal'])

watch(() => props.signal, (value) => {
  if (!value) return
  addEntry()
  emit('update:signal', false)
})

const entries = ref<any[]>()

function addEntry() {
  entries.value.push(['', getFallback(props.schema.inner, true)])
}

function deleteEntry(index: number) {
  if (props.disabled) return
  entries.value.splice(index, 1)
}

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
