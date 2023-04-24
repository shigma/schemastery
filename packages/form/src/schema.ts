import { defineComponent, h, PropType, ref, watch } from 'vue'
import { clone, deepEqual, getChoices, getFallback, Schema, valueMap } from './utils'
import { IconEllipsis } from './icons'
import SchemaItem from './item.vue'

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

function check(schema: any, value: any) {
  try {
    optional(schema)(value)
    return true
  } catch {
    return false
  }
}

export default defineComponent({
  props: {
    schema: {} as PropType<Schema>,
    initial: {} as PropType<any>,
    modelValue: {},
    instant: Boolean,
    invalid: Boolean,
    disabled: Boolean,
    branch: Boolean,
    prefix: { type: String, default: '' },
  },

  emits: ['update:modelValue', 'command'],

  setup(props, { attrs, emit, slots, expose }) {
    const config = ref()
    const choices = ref<Schema[]>()
    const cache = ref<any[]>()
    const active = ref<Schema>()
    const signal = ref(false)

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

    watch(() => [props.modelValue, props.schema] as const, ([value, schema]) => {
      config.value = value ?? getFallback(schema)
      active.value = schema
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

    return () => {
      if (!props.schema || props.schema.meta.hidden) return
      if (props.schema.type === 'const' || props.schema.type === 'never') return

      if (props.schema.type === 'object') {
        const output = Object.entries(props.schema.dict).map(([key, item]) => h('k-schema', {
          key,
          modelValue: config.value[key],
          'onUpdate:modelValue': (value: any) => config.value[key] = value,
          schema: item,
          initial: props.initial?.[key],
          instant: props.instant,
          disabled: props.disabled,
          prefix: props.prefix + key + '.',
        }, {
          default: () => [
            h('span', { class: 'prefix' }, props.prefix),
            h('span', key),
          ],
        }))
        if (props.schema.meta.description) {
          output.unshift(h('h2', { class: 'k-schema-header' }, props.schema.meta.description))
        }
        return output
      }

      if (props.schema.type === 'intersect' || props.schema.type === 'union' && choices.value.length === 1) {
        const isSwitch = props.schema?.meta.role === 'computed' && config.value?.$switch
        const output = choices.value.map((item, index) => h('k-schema', {
          key: index,
          modelValue: config.value,
          'onUpdate:modelValue': (value: any) => config.value = value,
          branch: props.schema.type === 'intersect',
          schema: { ...item, meta: { ...props.schema.meta, ...item.meta } },
          initial: props.initial,
          instant: props.instant,
          disabled: props.disabled,
          prefix: props.prefix,
        }, {
          default: () => slots.default(),
          after: () => {
            if (props.schema.meta.role !== 'computed') return
            if (isSwitch) {
              return h('el-button', {
                onClick: () => addBranch(),
              }, '添加分支')
            } else if (check(props.schema, props.initial)) {
              return h('el-button', {
                class: 'ellipsis',
                onClick: () => addBranch(),
              }, h(IconEllipsis))
            }
          },
        }))

        if (isSwitch) {
          const children = config.value.$switch.branches.map((item: any, index: number) => h('k-schema', {
            key: index,
            modelValue: config.value.$switch.branches[index].then,
            'onUpdate:modelValue': (value: any) => config.value.$switch.branches[index].then = value,
            schema: { ...props.schema.list[0], meta: { ...props.schema.meta, ...props.schema.list[0].meta, description: null } },
            disabled: props.disabled,
            instant: props.instant,
            'onCommand': (action: string) => handleComputedCommand(action, index),
          }, {
            default: () => [
              h('span', '当满足条件：'),
              h('k-filter-button', {
                modelValue: config.value.$switch.branches[index].case,
                'onUpdate:modelValue': (value: any) => config.value.$switch.branches[index].case = value,
                options: props.schema.meta.extra,
                disabled: props.disabled,
              }),
            ],
            menu: () => [
              h('el-dropdown-item', { divided: true, disabled: !index, command: 'up' }, '上移分支'),
              h('el-dropdown-item', { disabled: index === config.value.$switch.branches.length - 1, command: 'down' }, '下移分支'),
              h('el-dropdown-item', { command: 'delete' }, '删除分支'),
            ],
          }))
          children.push(h('k-schema', {
            modelValue: config.value.$switch.default,
            'onUpdate:modelValue': (value: any) => config.value.$switch.default = value,
            schema: { ...props.schema.list[0], meta: { ...props.schema.meta, ...props.schema.list[0].meta, description: null } },
            disabled: props.disabled,
            initial: props.initial?.$switch ? props.initial.$switch.default : props.initial,
            instant: props.instant,
          }, h('span', '其他情况下')))
          output.push(h('div', { class: 'k-schema-group' }, children))
        }
        return output
      }
    }
  },
})
