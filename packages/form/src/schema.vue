<template>
  <template v-if="isHidden"></template>
  <template v-else-if="schema.type === 'const' || schema.type === 'never'"></template>

  <template v-else-if="schema.type === 'object'">
    <h2 class="k-schema-header" v-if="schema.meta.description">{{ schema.meta.description }}</h2>
    <k-schema v-for="(item, key) in schema.dict" :key="key"
      v-model="config[key]"
      :schema="item"
      :initial="initial?.[key]"
      :instant="instant"
      :disabled="disabled"
      :prefix="prefix + key + '.'">
      <span class="prefix">{{ prefix }}</span>
      <span>{{ key }}</span>
    </k-schema>
  </template>

  <template v-else-if="schema.type === 'intersect' || schema.type === 'union' && choices.length === 1">
    <k-schema v-for="(item, index) in choices" :key="index"
      v-model="config"
      :branch="schema.type === 'intersect'"
      :initial="initial"
      :schema="{ ...item, meta: { ...item.meta, ...schema.meta } }"
      :instant="instant"
      :disabled="disabled"
      :prefix="prefix">
      <slot></slot>
    </k-schema>
  </template>

  <schema-item
    v-else-if="!branch && (prefix || !isComposite)"
    :disabled="disabled"
    :class="{ changed, required, invalid }"
    @command="handleCommand">
    <template #menu>
      <el-dropdown-item command="discard">撤销更改</el-dropdown-item>
      <el-dropdown-item command="default">恢复默认值</el-dropdown-item>
      <slot name="menu"></slot>
    </template>

    <template #header>
      <slot></slot>
    </template>

    <template #description>
      <k-markdown inline :source="schema.meta.description"></k-markdown>
    </template>

    <template #right>
      <template v-if="schema.type === 'union' && schema.meta.role !== 'radio'">
        <el-select v-model="selectModel" :disabled="disabled">
          <el-option
            v-for="(item, index) in choices"
            :key="index"
            :value="index"
            :label="item.meta.description || item.value"
          ></el-option>
        </el-select>
      </template>

      <template v-if="isPrimitive">
        <schema-primitive v-model="config" :schema="active" :disabled="disabled"></schema-primitive>
      </template>

      <template v-else-if="isComposite">
        <el-button solid @click="signal = true" :disabled="disabled">添加项</el-button>
      </template>

      <template v-else-if="schema.type === 'tuple'">
        <schema-primitive v-for="(item, index) in active.list" :key="index"
          v-model="config[index]" :schema="item" :disabled="disabled"></schema-primitive>
      </template>
    </template>

    <ul class="bottom" v-if="schema.type === 'union' && schema.meta.role === 'radio'">
      <li v-for="item in choices" :key="item.value">
        <el-radio
          v-model="config"
          :disabled="disabled"
          :label="item.value"
        >{{ item.meta.description || item.value }}</el-radio>
      </li>
    </ul>

    <ul class="bottom" v-else-if="schema.type === 'bitset'">
      <li v-for="(value, key) in schema.bits" :key="value">
        <bit-checkbox
          v-model="config"
          :disabled="disabled"
          :label="key"
          :value="value"
        ></bit-checkbox>
      </li>
    </ul>

    <div class="bottom" v-else-if="schema.type === 'string' && schema.meta.role === 'textarea'">
      <el-input autosize v-model="config" type="textarea" :disabled="disabled"></el-input>
    </div>
  </schema-item>

  <template v-if="isHidden || schema.type === 'union' && choices.length === 1"></template>

  <template v-else-if="isComposite">
    <div class="k-schema-group" v-if="prefix">
      <schema-group v-model:signal="signal"
        :schema="active" v-model="config" :prefix="prefix" :disabled="disabled" :instant="instant" :initial="initial ?? active.meta.default">
      </schema-group>
    </div>

    <!-- top level array / dict -->
    <template v-else>
      <h2 class="k-schema-header">
        {{ schema.meta.description || '配置列表' }}
        <el-button solid @click="signal = true" :disabled="disabled">添加项</el-button>
      </h2>
      <schema-group v-model:signal="signal"
        :schema="active" v-model="config" :prefix="prefix" :disabled="disabled" :instant="instant" :initial="initial">
      </schema-group>
    </template>
  </template>

  <!-- union containing object -->
  <template v-else-if="schema?.type === 'union' && choices.length > 1 && ['object', 'intersect'].includes(active?.type)">
    <k-schema 
      v-model="config"
      :initial="initial"
      :schema="{ ...active, meta: { ...active.meta, description: '' } }"
      :instant="instant"
      :disabled="disabled"
      :prefix="prefix"
    ></k-schema>
  </template>
</template>

<script lang="ts" setup>

import { watch, ref, computed } from 'vue'
import type { PropType } from 'vue'
import { deepEqual, getChoices, getFallback, Schema, validate } from './utils'
import { clone, isNullable, valueMap } from 'cosmokit'
import BitCheckbox from './bit.vue'
import SchemaItem from './item.vue'
import SchemaGroup from './group.vue'
import SchemaPrimitive from './primitive.vue'

const props = defineProps({
  schema: {} as PropType<Schema>,
  initial: {} as PropType<any>,
  modelValue: {},
  instant: Boolean,
  invalid: Boolean,
  disabled: Boolean,
  branch: Boolean,
  prefix: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'command'])

const changed = computed(() => {
  return !props.instant && !deepEqual(props.initial, props.modelValue)
})

const required = computed(() => {
  return props.schema.meta.required
    && isNullable(props.schema.meta.default)
    && isNullable(props.modelValue)
})

const choices = ref<Schema[]>()
const cache = ref<any[]>()
const active = ref<Schema>()

watch(() => props.schema, (value) => {
  if (!value?.list) {
    choices.value = []
    return
  }
  choices.value = getChoices(props.schema)
  cache.value = choices.value.map((item) => {
    if (item.type === 'const') return item.value
    return getFallback(item, true)
  })
}, { immediate: true })

const selectModel = computed({
  get() {
    if (active.value === props.schema) return
    return active.value.meta.description || active.value.value
  },
  set(index) {
    if (active.value === choices.value[index]) return
    config.value = cache.value[index]
    active.value = choices.value[index]
  },
})

const isHidden = computed(() => {
  return !props.schema || props.schema.meta.hidden
})

const isPrimitive = computed(() => {
  return ['string', 'number', 'boolean'].includes(active.value.type)
    && active.value.meta.role !== 'textarea'
})

const isComposite = computed(() => {
  return ['array', 'dict'].includes(active.value.type) && validate(active.value.inner)
})

const config = ref()
const signal = ref(false)

function optional(schema: Schema): Schema {
  if (schema.type === 'object') {
    return Schema.object(valueMap(schema.dict, (item) => {
      return item.type === 'const' ? item : item.required(false)
    }))
  } else if (schema.type === 'intersect') {
    return Schema.intersect(schema.list.map(optional))
  } else if (schema.type === 'union') {
    return Schema.union(schema.list.map(optional))
  } else {
    return schema
  }
}

watch(() => props.modelValue, (value) => {
  config.value = value ?? getFallback(props.schema)
  active.value = props.schema
  for (const item of choices.value) {
    try {
      optional(item)(config.value)
      active.value = item
      break
    } catch {}
  }
}, { immediate: true, deep: true })

watch(config, (value) => {
  if (!props.schema) return
  if (props.initial === undefined && deepEqual(value, props.schema.meta.default)) {
    emit('update:modelValue', undefined)
  } else {
    emit('update:modelValue', value)
  }
}, { deep: true })

function handleCommand(action: string) {
  if (action === 'discard') {
    emit('update:modelValue', clone(props.initial))
  } else if (action === 'default') {
    emit('update:modelValue', undefined)
  } else {
    emit('command', action)
  }
}

</script>

<style lang="scss">

.k-schema-header {
  font-size: 1.25rem;

  .el-button {
    float: right;
    transform: translateY(-3px);
  }
}

.k-schema-group {
  position: relative;
  padding-left: 1rem;
  border-bottom: 1px solid var(--el-border-color);

  &:empty {
    border-bottom: none;
  }

  > :first-child {
    border-top: none;
  }

  > :last-child {
    border-bottom: none;
  }
}

.schema-item {
  p {
    margin: 0;
    line-height: 1.7;
    font-size: 0.875rem;
  }

  ul {
    list-style: none;
    width: 100%;
    padding-left: 1rem;
    font-size: 0.875rem;

    .el-radio, .el-checkbox {
      height: 1.375rem;
    }
  }
}

</style>
