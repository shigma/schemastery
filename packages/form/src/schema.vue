<script lang="ts">

import { computed, defineComponent, h, PropType, ref, resolveComponent, VNode, watch } from 'vue'
import { check, clone, deepEqual, getChoices, getFallback, isNullable, makeArray, Schema } from './utils'
import { IconEllipsis } from './icons'
import { extensions } from '.'
import SchemaPrimitive from './primitive.vue'
import SchemaHeader from './header.vue'
import SchemaBase from './base.vue'

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

      const KSchema: any = resolveComponent('k-schema')

      if (props.schema.type === 'object') {
        const output = Object.entries(props.schema.dict).map(([key, item]) => h(KSchema, {
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
        const output = choices.value.map((item, index) => h(KSchema, {
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
          default: () => slots.default?.(),
          suffix: () => {
            if (props.schema.meta.role !== 'computed') return
            if (isSwitch) {
              return h(resolveComponent('el-button'), {
                onClick: () => addBranch(),
              }, () => '添加分支')
            } else if (check(props.schema, props.initial)) {
              return h(resolveComponent('el-button'), {
                class: 'ellipsis',
                onClick: () => addBranch(),
              }, () => h(IconEllipsis))
            }
          },
        }))

        if (isSwitch) {
          const children = config.value.$switch.branches.map((item: any, index: number) => h(KSchema, {
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
              h(resolveComponent('k-filter-button'), {
                modelValue: config.value.$switch.branches[index].case,
                'onUpdate:modelValue': (value: any) => config.value.$switch.branches[index].case = value,
                options: props.schema.meta.extra,
                disabled: props.disabled,
              }),
            ],
            menu: () => [
              h(resolveComponent('el-dropdown-item'), { divided: true, disabled: !index, command: 'up' }, () => '上移分支'),
              h(resolveComponent('el-dropdown-item'), { disabled: index === config.value.$switch.branches.length - 1, command: 'down' }, () => '下移分支'),
              h(resolveComponent('el-dropdown-item'), { command: 'delete' }, () => '删除分支'),
            ],
          }))
          children.push(h(KSchema, {
            modelValue: config.value.$switch.default,
            'onUpdate:modelValue': (value: any) => config.value.$switch.default = value,
            schema: { ...props.schema.list[0], meta: { ...props.schema.meta, ...props.schema.list[0].meta, description: null } },
            disabled: props.disabled,
            initial: props.initial?.$switch ? props.initial.$switch.default : props.initial,
            instant: props.instant,
          }, () => h('span', '其他情况下')))
          output.push(h('div', { class: 'k-schema-group' }, children))
        }
        return output
      }

      const output: VNode[] = []
      const isValid = check(active.value, config.value)
      if (!props.branch) {
        const [component, schema] = (() => {
          if (!isValid) return [SchemaBase, active.value]
          for (const ext of extensions) {
            const schema = [active.value, props.schema].find((schema) => {
              return schema.type === ext.type && (!ext.role || ext.role === schema.meta.role)
            })
            if (schema) return [ext.component, schema]
          }
          return [SchemaBase, active.value]
        })()

        output.push(h(component, {
          schema,
          prefix: props.prefix,
          initial: props.initial,
          disabled: props.disabled,
          class: {
            changed: !props.instant && !deepEqual(props.initial, props.modelValue),
            required: props.schema.meta.required && isNullable(props.schema.meta.default) && isNullable(props.modelValue),
            invalid: props.invalid,
          },
          modelValue: config.value,
          'onUpdate:modelValue': (value: any) => config.value = value,
        }, {
          prefix: () => {
            if (props.schema.type !== 'union' || props.schema.meta.role === 'radio') return
            return h(resolveComponent('el-select'), {
              modelValue: selectModel.value,
              'onUpdate:modelValue': (value: any) => selectModel.value = value,
              filterable: true,
              disabled: props.disabled,
            }, () => choices.value.map((item, index) => h(resolveComponent('el-option'), {
              key: index,
              value: index,
              label: item.meta.description || item.value,
            })))
          },
          suffix: () => slots.suffix?.(),
          header: () => h(SchemaHeader, {
            onCommand: handleCommand,
          }, {
            title: () => slots.default?.(),
            description: () => h(resolveComponent('k-markdown'), { source: props.schema.meta.description }),
            menu: () => [
              h(resolveComponent('el-dropdown-item'), { command: 'discard' }, () => '撤销更改'),
              h(resolveComponent('el-dropdown-item'), { command: 'default' }, () => '恢复默认值'),
              ...makeArray(slots.menu?.()),
            ],
          }),
          control: () => {
            if (!isValid) return
            if (['string', 'number', 'boolean'].includes(active.value.type)) {
              return h(SchemaPrimitive, {
                modelValue: config.value,
                'onUpdate:modelValue': (value: any) => config.value = value,
                schema: active.value,
                disabled: props.disabled,
              })
            }
          },
        }))
      }

      if (props.schema.type === 'union' && choices.value.length > 1 && ['object', 'intersect'].includes(active.value?.type)) {
        output.push(h(KSchema, {
          modelValue: config.value,
          'onUpdate:modelValue': (value: any) => config.value = value,
          initial: props.initial,
          instant: props.instant,
          disabled: props.disabled,
          prefix: props.prefix,
          schema: props.branch ? active.value : { ...active, meta: { ...active.value.meta, description: '' } },
        }))
      }
      return output
    }
  },
})

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
  border-bottom: 1px solid var(--el-border-color-light);

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

</style>
