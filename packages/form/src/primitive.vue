<template>
  <template v-if="schema.type === 'boolean'">
    <el-checkbox v-if="minimal" v-model="config" :class="{ nullable }" :disabled="disabled"></el-checkbox>
    <el-switch v-else v-model="config" :class="{ nullable }" :disabled="disabled"></el-switch>
  </template>

  <template v-else-if="schema.type === 'number'">
    <el-slider v-if="schema.meta.role === 'slider'" style="width: 200px"
      v-model="config" :disabled="disabled" :max="schema.meta.max" :min="schema.meta.min" :step="schema.meta.step"
    ></el-slider>
    <el-input-number v-else
      v-model="config" :disabled="disabled" :max="schema.meta.max" :min="schema.meta.min" :step="schema.meta.step"
      @focus="$emit('focus', $event)" @blur="$emit('blur', $event)"
    ></el-input-number>
  </template>

  <template v-else-if="schema.type === 'string'">
    <el-color-picker v-if="schema.meta.role === 'color'" v-model="config" show-alpha></el-color-picker>
    <el-time-picker
      v-else-if="schema.meta.role === 'time'" v-model="date"
      @focus="$emit('focus', $event)" @blur="$emit('blur', $event)"
    ></el-time-picker>
    <el-date-picker
      v-else-if="['date', 'datetime'].includes(schema.meta.role)" :type="schema.meta.role" v-model="date"
      @focus="$emit('focus', $event)" @blur="$emit('blur', $event)"
    ></el-date-picker>
    <el-input v-else v-model="config" :disabled="disabled" :class="{ minimal, nullable, invalid }"
      :style="{ width: minimal ? '100%' : isLink ? '16rem' : '12rem' }" :type="type"
      @focus="$emit('focus', $event)" @blur="$emit('blur', $event)">
      <template #prefix v-if="nullable"></template>
      <template #suffix>
        <span class="suffix-icon" v-if="isLink">
          <icon-external @click="onClickExternal(config)"></icon-external>
        </span>
        <span class="suffix-icon" v-else-if="schema.meta.role === 'secret'">
          <icon-eye v-if="showPass" @click="showPass = !showPass"></icon-eye>
          <icon-eye-slash v-else @click="showPass = !showPass"></icon-eye-slash>
        </span>
        <el-tooltip v-if="invalid" :content="t(...invalid)">
          <span class="suffix-icon">
            <icon-invalid class="invalid"></icon-invalid>
          </span>
        </el-tooltip>
      </template>
    </el-input>
  </template>

  <template v-else-if="schema.type === 'union'">
    <el-select
      v-model="selectModel"
      filterable
      :disabled="disabled"
      @focus="$emit('focus', $event)" @blur="$emit('blur', $event)"
    >
      <el-option
        v-for="(item, index) in schema.list"
        :key="index"
        :value="index"
        :label="tt(item.meta.description) || item.value"
      ></el-option>
    </el-select>
  </template>
</template>

<script lang="ts" setup>

import { computed, PropType, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { IconExternal, IconEye, IconEyeSlash, IconInvalid } from './icons'
import { isNullable } from 'cosmokit'
import { explain, useI18nText, useModel } from './utils'
import Schema from 'schemastery'
import zhCN from './locales/zh-CN.yml'
import enUS from './locales/en-US.yml'

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

const props = defineProps({
  schema: {} as PropType<Schema>,
  modelValue: {},
  disabled: Boolean,
  minimal: Boolean,
})

const showPass = ref(false)

const config = useModel()

const tt = useI18nText()

const nullable = computed(() => isNullable(config.value))
const invalid = computed(() => explain(props.schema, config.value))
const isLink = computed(() => ['url', 'link'].includes(props.schema.meta.role))

const type = computed(() => {
  const { type, meta } = props.schema
  return type === 'number' ? 'number' : meta.role === 'secret' && !showPass.value ? 'password' : 'text'
})

const date = computed({
  get() {
    if (!props.modelValue) return
    if (['date', 'datetime'].includes(props.schema.meta.role)) {
      return new Date(config.value)
    } else if (props.schema.meta.role === 'time') {
      return new Date('1970-01-01 ' + config.value)
    }
  },
  set(value) {
    if (props.schema.meta.role === 'datetime') {
      emit('update:modelValue', value.toLocaleString())
    } else if (props.schema.meta.role === 'date') {
      emit('update:modelValue', value.toLocaleDateString())
    } else if (props.schema.meta.role === 'time') {
      emit('update:modelValue', value.toLocaleTimeString())
    }
  },
})

const selectModel = computed({
  get() {
    const item = props.schema.list.find(item => item.value === config.value)
    if (!item) return
    return tt(item.meta.description) || item.value
  },
  set(index) {
    config.value = props.schema.list[index].value
  },
})

function onClickExternal(value: string) {
  if (!value) return
  open(value, '_blank')
}

const { t, setLocaleMessage } = useI18n({
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})

if (import.meta.hot) {
  import.meta.hot.accept('./locales/zh-CN.yml', (module) => {
    setLocaleMessage('zh-CN', module.default)
  })
  import.meta.hot.accept('./locales/en-US.yml', (module) => {
    setLocaleMessage('en-US', module.default)
  })
}

</script>

<style lang="scss">

.k-schema-item {
  .el-input {
    .suffix-icon {
      display: flex;
      width: 1rem;
      justify-content: center;
      align-items: center;
      margin-left: 6px;
    }

    .k-icon {
      color: var(--k-text-light);
      transition: var(--color-transition);
      cursor: pointer;
      height: 0.75rem;

      &:hover {
        color: var(--k-text-dark);
      }

      &.invalid {
        cursor: auto;
        color: var(--k-color-danger);
      }
    }

    &.nullable:not(:focus-within) .el-input__prefix {
      display: block;
      position: absolute;
      top: 50%;
      width: 40%;
      border-top: var(--el-border);
      transition: var(--color-transition);
    }
    
    .el-input__wrapper {
      padding-right: 9px;
    }

    &:not(.minimal).invalid .el-input__wrapper {
      box-shadow: 0 0 0 1px var(--k-color-danger) inset;
    }
  }

  .el-switch.nullable {
    .el-switch__core {
      background-color: transparent;
      border: 1px solid var(--el-border-color);
    }

    .el-switch__action {
      left: 11px;
      width: 16px;
      border-radius: 0;
      height: 1px;
      background-color: var(--el-border-color);
    }

    &:hover {
      .el-switch__core {
        border-color: var(--el-color-primary);
      }
    }
  }
}

</style>
