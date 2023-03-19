<template>
  <template v-if="isHidden"></template>
  <template v-else-if="schema.type === 'const' || schema.type === 'never'"></template>

  <template v-else-if="schema.type === 'object'">
    <h2 class="k-schema-header" v-if="label">{{ label }}</h2>
    <k-schema v-for="(item, key) in schema.dict" :key="key"
      v-model="config[key]"
      :schema="item"
      :initial="initial?.[key]"
      :instant="instant"
      :disabled="disabled"
      :prefix="prefix + key + '.'">
      <template v-if='item.meta.label'>
        <span>{{ item.meta.label }}</span>
      </template>
      <template v-else>
        <span class="prefix">{{ prefix }}</span>
        <span>{{ key }}</span>
      </template>
    </k-schema>
  </template>

  <template v-else-if="schema.type === 'intersect' || schema.type === 'union' && choices.length === 1">
    <k-schema v-for="(item, index) in choices" :key="index"
      v-model="config"
      :branch="schema.type === 'intersect'"
      :initial="initial"
      :schema="{ ...item, meta: { ...schema.meta, ...item.meta } }"
      :instant="instant"
      :disabled="disabled"
      :prefix="prefix">
      <slot></slot>
      <template #after v-if="schema.meta.role === 'computed'">
        <el-button v-if="isSwitch" @click="addBranch">
          添加分支
        </el-button>
        <el-button class="ellipsis" v-else-if="check(schema, initial)" @click="addBranch">
          <icon-ellipsis></icon-ellipsis>
        </el-button>
      </template>
    </k-schema>

    <div class="k-schema-group" v-if="isSwitch">
      <k-schema
        v-for="(_, index) in config.$switch.branches"
        v-model="config.$switch.branches[index].then"
        @command="handleComputedCommand($event, index)"
        :key="index"
        :schema="{ ...schema.list[0], meta: { ...schema.meta, ...schema.list[0].meta, description: null } }"
        :disabled="disabled"
        :instant="instant">
        <template #menu>
          <el-dropdown-item divided :disabled="!index" command="up">上移分支</el-dropdown-item>
          <el-dropdown-item :disabled="index === config.$switch.branches.length - 1" command="down">下移分支</el-dropdown-item>
          <el-dropdown-item command="delete">删除分支</el-dropdown-item>
        </template>
        <span>当满足条件：</span>
        <k-filter-button v-model="config.$switch.branches[index].case" :options="schema.meta.extra" :disabled="disabled"></k-filter-button>
      </k-schema>
      <k-schema
        v-model="config.$switch.default"
        :schema="{ ...schema.list[0], meta: { ...schema.meta, ...schema.list[0].meta, description: null } }"
        :disabled="disabled"
        :initial="initial?.$switch ? initial.$switch.default : initial"
        :instant="instant">
        <span>其他情况下</span>
      </k-schema>
    </div>
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
      <k-markdown :source="schema.meta.description"></k-markdown>
    </template>

    <template #right>
      <slot name="before"></slot>

      <template v-if="schema.type === 'union' && schema.meta.role !== 'radio' && !isSwitch">
        <el-select filterable v-model="selectModel" :disabled="disabled">
          <el-option
            v-for="(item, index) in choices"
            :key="index"
            :value="index"
            :label="item.meta.label || item.meta.description || item.value"
            :title="item.meta.description"
          ></el-option>
        </el-select>
      </template>

      <template v-if="isValid">
        <template v-if="isPrimitive">
          <schema-primitive v-model="config" :schema="active" :disabled="disabled"></schema-primitive>
        </template>

        <template v-else-if="['array', 'dict'].includes(active.type)">
          <el-button solid @click="signal = true" :disabled="disabled">添加项</el-button>
        </template>

        <template v-else-if="schema.type === 'tuple'">
          <schema-primitive v-for="(item, index) in active.list" :key="index"
            v-model="config[index]" :schema="item" :disabled="disabled"></schema-primitive>
        </template>
      </template>

      <slot name="after"></slot>
    </template>

    <template v-if="isValid">
      <ul class="bottom" v-if="schema.type === 'union' && schema.meta.role === 'radio'">
        <li v-for="item in choices" :key="item.value">
          <el-radio
            v-model="config"
            :disabled="disabled"
            :label="item.value"
            :title="item.meta.description"
          >{{ item.meta.label || item.meta.description || item.value }}</el-radio>
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

      <schema-table
        v-else-if="isTable"
        class="bottom"
        v-model="config"
        v-model:signal="signal"
        :schema="schema"
        :disabled="disabled"
      ></schema-table>

      <k-filter
        v-else-if="schema.type === 'any' && schema.meta.role === 'filter'"
        class="bottom"
        v-model="config"
        :disabled="disabled"
      ></k-filter>
    </template>
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
        {{ label || '配置列表' }}
        <el-button solid @click="signal = true" :disabled="disabled">添加项</el-button>
      </h2>
      <schema-group v-model:signal="signal"
        :schema="active" v-model="config" :prefix="prefix" :disabled="disabled" :instant="instant" :initial="initial">
      </schema-group>
    </template>
  </template>

  <!-- union containing object -->
  <template v-else-if="schema?.type === 'union' && !isSwitch && choices.length > 1 && ['object', 'intersect'].includes(active?.type)">
    <k-schema
      v-model="config"
      :initial="initial"
      :schema="branch ? active : { ...active, meta: { ...active.meta, description: '' } }"
      :instant="instant"
      :disabled="disabled"
      :prefix="prefix"
    ></k-schema>
  </template>
</template>

<script lang="ts" setup>

import { watch, ref, computed } from 'vue'
import type { PropType } from 'vue'
import { deepEqual, getChoices, getFallback, Schema } from './utils'
import { clone, isNullable, valueMap } from 'cosmokit'
import { IconEllipsis } from './icons'
import BitCheckbox from './bit.vue'
import SchemaItem from './item.vue'
import SchemaGroup from './group.vue'
import SchemaTable from './table.vue'
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

function check(schema: any, value: any) {
  try {
    optional(schema)(value)
    return true
  } catch {
    return false
  }
}

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

const isValid = computed(() => {
  return check(active.value, config.value)
})

const isPrimitive = computed(() => {
  return ['string', 'number', 'boolean'].includes(active.value.type)
    && active.value.meta.role !== 'textarea'
})

const label = computed(() => props.schema.meta.label ?? props.schema.meta.description)

const isSwitch = computed(() => {
  return props.schema?.meta.role === 'computed' && config.value?.$switch
})

const isComposite = computed(() => {
  return ['array', 'dict'].includes(active.value.type) && active.value.meta.role !== 'table'
})

const isTable = computed(() => {
  return props.schema.meta.role !== 'computed'
    && ['array', 'dict'].includes(active.value.type)
    && active.value.meta.role === 'table'
    && ['string', 'number'].includes(active.value.inner.type)
})

function addBranch() {
  if (config.value?.$switch) {
    config.value.$switch.branches.push({ case: null, then: null })
  } else {
    config.value = {
      $switch: {
        branches: [{ case: null, then: null }],
        default: clone(config.value),
      },
    }
  }
}

const config = ref()
const signal = ref(false)

function optional(schema: Schema): Schema {
  if (schema.type === 'const') return schema
  if (schema.type === 'object') {
    return Schema.object(valueMap(schema.dict, optional))
  } else if (schema.type === 'tuple') {
    return Schema.tuple(schema.list.map(optional))
  } else if (schema.type === 'intersect') {
    return Schema.intersect(schema.list.map(optional))
  } else if (schema.type === 'union') {
    return Schema.union(schema.list.map(optional))
  } else {
    return Schema(schema).required(false)
  }
}

watch(() => props.modelValue, (value) => {
  config.value = value ?? getFallback(props.schema)
  active.value = props.schema
  for (const item of choices.value) {
    if (!check(item, config.value)) continue
    active.value = item
    break
  }
}, { immediate: true, deep: true })

watch(config, (value) => {
  if (!props.schema) return
  if (deepEqual(value, props.schema.meta.default)) {
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

function handleComputedCommand(action: string, index?: number) {
  if (action === 'down') {
    config.value.$switch.branches.splice(index + 1, 0, config.value.$switch.branches.splice(index, 1)[0])
  } else if (action === 'up') {
    config.value.$switch.branches.splice(index - 1, 0, config.value.$switch.branches.splice(index, 1)[0])
  } else if (action === 'delete') {
    if (config.value.$switch.branches.length > 1) {
      config.value.$switch.branches.splice(index, 1)
    } else {
      config.value = config.value.$switch.default
    }
  }
}

</script>

<style lang="scss">

.k-schema-header {
  font-size: 1.25rem;

  .el-button {
    float: right;
    transform: translateY(-2px);
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

  .el-button.ellipsis {
    padding: 8px 10px;
  }

  .el-button + .el-button {
    margin-left: 0;
  }
}

</style>
